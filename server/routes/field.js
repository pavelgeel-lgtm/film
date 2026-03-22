import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/field/issuances — предметы на руках у текущего пользователя
router.get("/issuances", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT isr.*,
             i.name as item_name, i.code as item_code,
             i.warehouse, i.cell, i.condition
      FROM issuances isr
      LEFT JOIN items i ON i.id = isr.item_id
      WHERE isr.issued_to_user = $1 AND isr.returned_at IS NULL
      ORDER BY isr.issued_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/field/issuances/:id/confirm — подтвердить получение (подпись получателя)
router.post("/issuances/:id/confirm", async (req, res) => {
  const { signature } = req.body;
  if (!signature) return res.status(400).json({ error: "Подпись обязательна" });

  try {
    const { rows } = await pool.query(`
      UPDATE issuances
      SET receipt_confirmed_at = NOW(), receipt_signature = $2
      WHERE id = $1 AND issued_to_user = $3 AND receipt_confirmed_at IS NULL
      RETURNING *
    `, [req.params.id, signature, req.user.id]);

    if (!rows[0]) return res.status(404).json({ error: "Выдача не найдена или уже подтверждена" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/field/requests — мои запросы на выдачу
router.get("/requests", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, i.name as item_name
      FROM warehouse_requests r
      LEFT JOIN items i ON i.id = r.item_id
      WHERE r.requested_by = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/field/requests — создать запрос на выдачу
router.post("/requests", async (req, res) => {
  const { item_id, item_name_free, project, scene, needed_by, notes } = req.body;
  if (!item_name_free && !item_id) {
    return res.status(400).json({ error: "item_id или item_name_free обязателен" });
  }
  try {
    const { rows } = await pool.query(`
      INSERT INTO warehouse_requests
        (item_id, item_name_free, requested_by, project, scene, needed_by, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [item_id || null, item_name_free || null, req.user.id, project, scene, needed_by, notes]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
