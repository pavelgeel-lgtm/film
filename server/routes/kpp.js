import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../db/pool.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Локальное хранилище (заменится на Yandex Object Storage в модуле Фото)
const UPLOAD_DIR = path.resolve("uploads/kpp");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.-]/g, "_");
    cb(null, `${ts}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel", "text/plain"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/kpp/upload — загрузка КПП или сценария
router.post("/upload", requireRole("admin", "kpp", "warehouse"), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не загружен или неверный формат" });

  const { doc_type, project, shoot_date } = req.body;
  // doc_type: "kpp" | "script" | "other"

  try {
    const { rows } = await pool.query(`
      INSERT INTO kpp_files (filename, storage_key, uploaded_by, parsed_data, role_notes)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [
      req.file.originalname,
      req.file.filename,       // локальный путь; в YOS будет s3-ключ
      req.user.id,
      JSON.stringify({ doc_type: doc_type || "kpp", project, shoot_date, status: "uploaded" }),
      JSON.stringify({}),
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/kpp/files?project=НАШ СПЕЦНАЗ-4
router.get("/files", async (req, res) => {
  const { project } = req.query;
  let q = `
    SELECT f.*, u.name as uploaded_by_name
    FROM kpp_files f
    LEFT JOIN users u ON u.id = f.uploaded_by
    WHERE 1=1
  `;
  const params = [];
  if (project) {
    params.push(`%${project}%`);
    q += ` AND f.parsed_data->>'project' ILIKE $${params.length}`;
  }
  q += " ORDER BY f.created_at DESC";

  try {
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/kpp/files/:id/download — скачать файл
router.get("/files/:id/download", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM kpp_files WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    const filePath = path.join(UPLOAD_DIR, rows[0].storage_key);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Файл не найден на диске" });
    res.download(filePath, rows[0].filename);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/kpp/files/:id/notes — пометки по ролям
// body: { role: "реквизит" | "костюм" | "грим" | "транспорт", note: "..." }
router.patch("/files/:id/notes", async (req, res) => {
  const { role, note } = req.body;
  if (!role) return res.status(400).json({ error: "role обязателен" });

  try {
    const { rows } = await pool.query(`
      UPDATE kpp_files
      SET role_notes = role_notes || $2::jsonb
      WHERE id = $1 RETURNING *
    `, [req.params.id, JSON.stringify({ [role]: note })]);

    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/kpp/files/:id/parse — AI парсинг через Groq
router.post("/files/:id/parse", requireRole("admin", "kpp", "warehouse"), async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM kpp_files WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.status(503).json({ error: "GROQ_API_KEY не настроен на сервере" });

    const filePath = path.join(UPLOAD_DIR, rows[0].storage_key);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Файл не найден на диске" });

    // Читаем файл как текст
    let text;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch {
      text = fs.readFileSync(filePath).toString("latin1");
    }

    // Обрезаем до 12000 символов — хватит для 1 блока КПП
    const excerpt = text.slice(0, 12000);

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content: `Ты — AI-ассистент для российского кинопроизводства. Извлеки из КПП/сценария структурированные данные и верни ТОЛЬКО валидный JSON без пояснений.

Формат:
{
  "scenes": [{
    "id": "номер сцены",
    "type": "ИНТ или НАТ",
    "loc": "локация",
    "date": "ДД.ММ.ГГГГ",
    "time": "ЧЧ:ММ",
    "dur": "Х ч ХХ мин",
    "desc": "краткое описание",
    "items": [{"name": "реквизит", "dept": "реквизит|костюм|транспорт|грим", "status": "Нет", "note": ""}],
    "makeup": [{"char": "персонаж", "actor": "актёр", "look": "грим", "cont": "-"}]
  }]
}`,
          },
          { role: "user", content: `Файл: ${rows[0].filename}\n\n${excerpt}` },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", errBody);
      return res.status(502).json({ error: "Ошибка Groq API", detail: errBody.slice(0, 200) });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content || "{}";

    // Извлекаем JSON из ответа
    let parsed;
    try {
      const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      parsed = JSON.parse(match ? match[0] : content);
    } catch {
      parsed = { raw: content };
    }

    // Сохраняем в БД
    await pool.query(
      `UPDATE kpp_files SET parsed_data = parsed_data || $2::jsonb WHERE id = $1`,
      [req.params.id, JSON.stringify({ parse_status: "done", scenes: parsed.scenes || parsed })]
    );

    res.json({ status: "ok", scenes: parsed.scenes || parsed, file: rows[0].filename });
  } catch (err) {
    console.error("parse error:", err);
    res.status(500).json({ error: "Ошибка сервера", detail: err.message });
  }
});

export default router;
