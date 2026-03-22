import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// ── ITEMS ──────────────────────────────────────────────────────────────────

// GET /api/items?status=available&search=носилки&category=Декор
router.get("/items", async (req, res) => {
  const { status, search, category } = req.query;
  let q = "SELECT * FROM items WHERE 1=1";
  const params = [];

  if (status) {
    params.push(status);
    q += ` AND status = $${params.length}`;
  }
  if (category) {
    params.push(category);
    q += ` AND category = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    q += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
  }
  q += " ORDER BY created_at DESC";

  try {
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/items/:id
router.get("/items/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM items WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/items
router.post("/items", requireRole("admin", "warehouse"), async (req, res) => {
  const { code, name, category, condition, value, tags, origin, unique_marks, warehouse, cell } = req.body;
  if (!code || !name) return res.status(400).json({ error: "code и name обязательны" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO items (code, name, category, condition, value, tags, origin, unique_marks, warehouse, cell)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [code, name, category, condition, value, tags, origin, unique_marks, warehouse, cell]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Код уже существует" });
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/items/:id
router.patch("/items/:id", requireRole("admin", "warehouse"), async (req, res) => {
  const allowed = ["name","category","status","condition","value","tags","origin","unique_marks","warehouse","cell"];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: "Нет полей для обновления" });

  const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const vals = fields.map(f => req.body[f]);

  try {
    const { rows } = await pool.query(
      `UPDATE items SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...vals]
    );
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// ── REQUESTS ───────────────────────────────────────────────────────────────

// GET /api/requests?status=new
router.get("/requests", async (req, res) => {
  const { status } = req.query;
  let q = `
    SELECT r.*, i.name as item_name, i.warehouse, i.cell, i.condition,
           u.name as requested_by_name, u.role as requested_by_role
    FROM warehouse_requests r
    LEFT JOIN items i ON i.id = r.item_id
    LEFT JOIN users u ON u.id = r.requested_by
    WHERE 1=1
  `;
  const params = [];
  if (status) { params.push(status); q += ` AND r.status = $${params.length}`; }
  q += " ORDER BY r.created_at DESC";
  try {
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/requests — создать запрос (кабинет площадки / КПП)
router.post("/requests", async (req, res) => {
  const { item_id, item_name_free, project, scene, needed_by, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO warehouse_requests
         (item_id, item_name_free, requested_by, project, scene, needed_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [item_id || null, item_name_free || null, req.user.id, project, scene, needed_by, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/requests/:id  { status: "confirmed" | "rejected" }
router.patch("/requests/:id", requireRole("admin", "warehouse"), async (req, res) => {
  const { status } = req.body;
  if (!["confirmed", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status должен быть confirmed или rejected" });
  }
  try {
    const { rows } = await pool.query(
      "UPDATE warehouse_requests SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id, status]
    );
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/requests/:id/issue — выдача предмета + подпись
router.post("/requests/:id/issue", requireRole("admin", "warehouse"), async (req, res) => {
  const { condition_at_issue, signature } = req.body;
  if (!signature) return res.status(400).json({ error: "Подпись обязательна" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: [reqRow] } = await client.query(
      "SELECT * FROM warehouse_requests WHERE id = $1 AND status = 'confirmed'",
      [req.params.id]
    );
    if (!reqRow) return res.status(404).json({ error: "Запрос не найден или не подтверждён" });

    // создаём запись выдачи
    const { rows: [issuance] } = await client.query(
      `INSERT INTO issuances
         (item_id, issued_to_user, project, return_date, issued_by, issue_signature)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [reqRow.item_id, reqRow.requested_by, reqRow.project, reqRow.needed_by, req.user.id, signature]
    );

    // меняем статус предмета
    if (reqRow.item_id) {
      await client.query(
        "UPDATE items SET status = 'issued', updated_at = NOW() WHERE id = $1",
        [reqRow.item_id]
      );
      if (condition_at_issue) {
        await client.query(
          "UPDATE items SET condition = $1, updated_at = NOW() WHERE id = $2",
          [condition_at_issue, reqRow.item_id]
        );
      }
    }

    // закрываем запрос
    await client.query(
      "UPDATE warehouse_requests SET status = 'issued', issuance_id = $2, updated_at = NOW() WHERE id = $1",
      [req.params.id, issuance.id]
    );

    await client.query("COMMIT");
    res.json({ issuance });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    client.release();
  }
});

// ── ISSUANCES ──────────────────────────────────────────────────────────────

// GET /api/issuances — активные выдачи (не возвращены)
router.get("/issuances", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT isr.*,
             i.name as item_name, i.code as item_code, i.warehouse, i.cell,
             u.name as issued_to_name
      FROM issuances isr
      LEFT JOIN items i ON i.id = isr.item_id
      LEFT JOIN users u ON u.id = isr.issued_to_user
      WHERE isr.returned_at IS NULL
      ORDER BY isr.issued_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/issuances/:id/return — возврат + подпись
router.post("/issuances/:id/return", requireRole("admin", "warehouse"), async (req, res) => {
  const { condition_at_return, damaged, signature, notes } = req.body;
  if (!signature) return res.status(400).json({ error: "Подпись обязательна" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: [isr] } = await client.query(
      "SELECT * FROM issuances WHERE id = $1 AND returned_at IS NULL",
      [req.params.id]
    );
    if (!isr) return res.status(404).json({ error: "Выдача не найдена или уже возвращена" });

    // обновляем выдачу
    await client.query(
      `UPDATE issuances SET
         returned_at = NOW(), returned_by = $2,
         return_signature = $3, notes = $4
       WHERE id = $1`,
      [req.params.id, req.user.id, signature, notes || null]
    );

    // меняем статус предмета
    const newStatus = damaged ? "repair" : "available";
    await client.query(
      "UPDATE items SET status = $1, condition = $2, updated_at = NOW() WHERE id = $3",
      [newStatus, condition_at_return, isr.item_id]
    );

    await client.query("COMMIT");
    res.json({ ok: true, newStatus });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  } finally {
    client.release();
  }
});

export default router;
