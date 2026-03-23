import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../db/pool.js";

const router = Router();

const SALT_ROUNDS = 12;
const ACCESS_TTL  = "15m";
const REFRESH_TTL = "30d";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signAccess(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

async function createRefresh(userId) {
  const raw = crypto.randomBytes(48).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, hash, expiresAt]
  );
  return raw;
}

// POST /api/auth/register  (только admin может создавать пользователей)
router.post("/register", async (req, res) => {
  const { name, email, password, pin, role } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "name и password обязательны" });
  }
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const pinHash = pin ? await bcrypt.hash(String(pin), SALT_ROUNDS) : null;
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, pin_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email || null, passwordHash, pinHash, role || "warehouse"]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email уже занят" });
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/auth/login  (email + password)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email и password обязательны" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const access  = signAccess(user);
    const refresh = await createRefresh(user.id);
    res.json({ access, refresh, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/auth/pin  (id + PIN — для мобильного PWA)
router.post("/pin", async (req, res) => {
  const { userId, pin } = req.body;
  if (!userId || !pin) {
    return res.status(400).json({ error: "userId и pin обязательны" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND is_active = true",
      [userId]
    );
    const user = rows[0];
    if (!user || !user.pin_hash || !(await bcrypt.compare(String(pin), user.pin_hash))) {
      return res.status(401).json({ error: "Неверный PIN" });
    }
    const access  = signAccess(user);
    const refresh = await createRefresh(user.id);
    res.json({ access, refresh, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "token обязателен" });

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const { rows } = await pool.query(
      `SELECT rt.*, u.id as uid, u.name, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW() AND u.is_active = true`,
      [hash]
    );
    const row = rows[0];
    if (!row) return res.status(401).json({ error: "Токен недействителен или истёк" });

    // ротация: удаляем старый, создаём новый
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hash]);
    const newRefresh = await createRefresh(row.uid);
    const access = signAccess({ id: row.uid, name: row.name, role: row.role });

    res.json({ access, refresh: newRefresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const { token } = req.body;
  if (token) {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hash]);
  }
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Нет токена" });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [payload.id]
    );
    res.json(rows[0] || {});
  } catch {
    res.status(401).json({ error: "Токен недействителен" });
  }
});

router.get("/users", async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Нет токена" });
  try {
    jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, name, email, role FROM users ORDER BY name"
    );
    res.json(rows);
  } catch {
    res.status(401).json({ error: "Токен недействителен" });
  }
});

export default router;
