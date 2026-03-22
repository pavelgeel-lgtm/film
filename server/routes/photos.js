import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { authenticate } from "../middleware/auth.js";
import pool from "../db/pool.js";
import crypto from "crypto";

const router = Router();
router.use(authenticate);

// ── S3 / Yandex Object Storage ─────────────────────────────────────────────
const s3 = new S3Client({
  region: process.env.YOS_REGION || "ru-central1",
  endpoint: process.env.YOS_ENDPOINT || "https://storage.yandexcloud.net",
  credentials: {
    accessKeyId:     process.env.YOS_ACCESS_KEY || "",
    secretAccessKey: process.env.YOS_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET = process.env.YOS_BUCKET || "";
const PUBLIC_URL = (key) =>
  `${process.env.YOS_ENDPOINT || "https://storage.yandexcloud.net"}/${BUCKET}/${key}`;

// ── Multer — только в память, sharp сожмёт сам ────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(file.mimetype);
    cb(null, ok);
  },
});

// ── POST /api/photos/upload ────────────────────────────────────────────────
// body (multipart): file, ref_type, ref_id
router.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не загружен или неверный формат" });

  const { ref_type, ref_id } = req.body;
  if (!ref_type || !ref_id) return res.status(400).json({ error: "ref_type и ref_id обязательны" });

  try {
    // Сжать в WebP (max 1920px, 82% quality)
    const webp = await sharp(req.file.buffer)
      .rotate()                          // исправить ориентацию EXIF
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const key = `photos/${ref_type}/${ref_id}/${crypto.randomUUID()}.webp`;

    // Загрузить в YOS
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webp,
      ContentType: "image/webp",
      ACL: "public-read",
    }));

    const url = PUBLIC_URL(key);

    // Сохранить в БД
    const { rows } = await pool.query(`
      INSERT INTO photos (ref_type, ref_id, storage_key, url, size_bytes, uploaded_by)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [ref_type, ref_id, key, url, webp.byteLength, req.user.id]);

    // Обновить счётчик фото у сущности
    await updatePhotoCount(ref_type, Number(ref_id));

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка загрузки фото" });
  }
});

// ── GET /api/photos?ref_type=item&ref_id=5 ────────────────────────────────
router.get("/", async (req, res) => {
  const { ref_type, ref_id } = req.query;
  if (!ref_type || !ref_id) return res.status(400).json({ error: "ref_type и ref_id обязательны" });
  try {
    const { rows } = await pool.query(
      "SELECT * FROM photos WHERE ref_type=$1 AND ref_id=$2 ORDER BY created_at DESC",
      [ref_type, ref_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ── DELETE /api/photos/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM photos WHERE id=$1 AND uploaded_by=$2",
      [req.params.id, req.user.id]
    );
    const photo = rows[0];
    if (!photo) return res.status(404).json({ error: "Фото не найдено" });

    // Удалить из YOS
    if (BUCKET) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: photo.storage_key })).catch(() => {});
    }

    await pool.query("DELETE FROM photos WHERE id=$1", [req.params.id]);
    await updatePhotoCount(photo.ref_type, photo.ref_id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ── helper ─────────────────────────────────────────────────────────────────
async function updatePhotoCount(refType, refId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*) FROM photos WHERE ref_type=$1 AND ref_id=$2",
    [refType, refId]
  );
  const count = Number(rows[0].count);
  const tableMap = { item: "items", vehicle: "vehicles", location: "locations" };
  const tbl = tableMap[refType];
  if (tbl) {
    await pool.query(`UPDATE ${tbl} SET photo_count=$1 WHERE id=$2`, [count, refId]);
  }
}

export default router;
