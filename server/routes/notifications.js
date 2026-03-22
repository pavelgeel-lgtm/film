import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// POST /api/push/subscribe — сохранить подписку браузера
router.post("/subscribe", async (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: "subscription обязателен" });

  try {
    // Upsert по endpoint чтобы не дублировать
    await pool.query(`
      INSERT INTO push_subscriptions (user_id, subscription)
      VALUES ($1,$2)
      ON CONFLICT DO NOTHING
    `, [req.user.id, subscription]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /api/push/unsubscribe
router.delete("/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  try {
    await pool.query(
      "DELETE FROM push_subscriptions WHERE user_id=$1 AND subscription->>'endpoint'=$2",
      [req.user.id, endpoint]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/push/vapid-public — клиент получает ключ для подписки
router.get("/vapid-public", (_req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || "" });
});

// GET /api/notifications — уведомления текущего пользователя
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id=$1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE user_id=$1",
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
