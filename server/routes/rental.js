import { Router } from "express";
import pool from "../db/pool.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// ── CONTRACTS ──────────────────────────────────────────────────────────────

// GET /api/contracts?status=draft&renter=Мосфильм
router.get("/contracts", async (req, res) => {
  const { status, renter } = req.query;
  let q = `
    SELECT c.*, u.name as signed_by_name, cb.name as created_by_name
    FROM contracts c
    LEFT JOIN users u  ON u.id  = c.signed_by
    LEFT JOIN users cb ON cb.id = c.created_by
    WHERE 1=1
  `;
  const params = [];
  if (status) { params.push(status); q += ` AND c.status = $${params.length}`; }
  if (renter) { params.push(`%${renter}%`); q += ` AND c.project ILIKE $${params.length}`; }
  q += " ORDER BY c.created_at DESC";
  try {
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/contracts/:id
router.get("/contracts/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as signed_by_name
      FROM contracts c
      LEFT JOIN users u ON u.id = c.signed_by
      WHERE c.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/contracts
// body: { ref_type, ref_id, renter_name, renter_type, project, start_date, end_date, items, total_price }
router.post("/contracts", requireRole("admin", "warehouse"), async (req, res) => {
  const {
    ref_type = "other", ref_id = 0,
    renter_name, renter_type, project,
    start_date, end_date, items, total_price,
  } = req.body;
  if (!renter_name) return res.status(400).json({ error: "renter_name обязателен" });

  try {
    // Храним состав аренды в поле project как JSON (через meta_json)
    const { rows } = await pool.query(`
      INSERT INTO contracts
        (ref_type, ref_id, project, start_date, end_date, total_price, status, created_by, meta_json)
      VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8) RETURNING *
    `, [
      ref_type, ref_id, project || renter_name,
      start_date, end_date, total_price,
      req.user.id,
      JSON.stringify({ renter_name, renter_type: renter_type || "Компания", items: items || [] }),
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// PATCH /api/contracts/:id
router.patch("/contracts/:id", requireRole("admin", "warehouse"), async (req, res) => {
  const allowed = ["project", "start_date", "end_date", "total_price", "status"];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: "Нет полей для обновления" });
  const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const vals = fields.map(f => req.body[f]);
  try {
    const { rows } = await pool.query(
      `UPDATE contracts SET ${sets} WHERE id = $1 RETURNING *`,
      [req.params.id, ...vals]
    );
    if (!rows[0]) return res.status(404).json({ error: "Не найдено" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /api/contracts/:id/sign — подписать договор
router.post("/contracts/:id/sign", async (req, res) => {
  const { signature } = req.body;
  if (!signature) return res.status(400).json({ error: "Подпись обязательна" });
  try {
    const { rows } = await pool.query(`
      UPDATE contracts
      SET status = 'signed', signature = $2, signed_by = $3, signed_at = NOW()
      WHERE id = $1 AND status IN ('draft', 'active')
      RETURNING *
    `, [req.params.id, signature, req.user.id]);
    if (!rows[0]) return res.status(404).json({ error: "Договор не найден или уже подписан" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /api/contracts/:id/print — HTML договора для печати → PDF через браузер
router.get("/contracts/:id/print", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as signed_by_name, cb.name as created_by_name
      FROM contracts c
      LEFT JOIN users u  ON u.id  = c.signed_by
      LEFT JOIN users cb ON cb.id = c.created_by
      WHERE c.id = $1
    `, [req.params.id]);
    const c = rows[0];
    if (!c) return res.status(404).json({ error: "Не найдено" });

    const meta = c.meta_json || {};
    const items = meta.items || [];
    const days = c.start_date && c.end_date
      ? Math.max(1, Math.ceil((new Date(c.end_date) - new Date(c.start_date)) / 86400000))
      : "—";

    const itemsRows = items.map(it => `
      <tr>
        <td>${it.name || it.item || ""}</td>
        <td style="text-align:right">${(it.price || 0).toLocaleString("ru-RU")} ₽/сут</td>
        <td style="text-align:right">${days} дн.</td>
        <td style="text-align:right">${((it.price || 0) * (Number(days) || 1)).toLocaleString("ru-RU")} ₽</td>
      </tr>
    `).join("");

    const signatureImg = c.signature
      ? `<img src="${c.signature}" style="height:60px;display:block;margin-top:8px" />`
      : '<div style="border-bottom:1px solid #000;height:50px;margin-top:8px"></div>';

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8"/>
  <title>Договор аренды ${c.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;font-size:13px;color:#1e293b;padding:40px;max-width:800px;margin:0 auto}
    h1{font-size:20px;font-weight:700;margin-bottom:4px}
    h2{font-size:14px;font-weight:700;margin:24px 0 10px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px}
    .meta-item label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#94a3b8;display:block;margin-bottom:2px}
    .meta-item span{font-weight:600}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#f1f5f9;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b}
    td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:13px}
    .total-row td{font-weight:700;font-size:14px;background:#e0f2fe;color:#0369a1}
    .sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
    .sig-block label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#94a3b8;display:block;margin-bottom:4px}
    .sig-block .name{font-weight:600;margin-top:8px;font-size:12px}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a}
    @media print{body{padding:20px}@page{margin:1cm}}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px">3X MEDIA CLOUD</div>
      <h1>Договор аренды реквизита</h1>
      <div style="margin-top:6px;font-size:13px;color:#64748b">№ ${c.id} · Составлен: ${new Date(c.created_at).toLocaleDateString("ru-RU")}</div>
    </div>
    <span class="badge">${c.status === "signed" ? "✓ Подписан" : "Черновик"}</span>
  </div>

  <h2>Стороны договора</h2>
  <div class="meta">
    <div class="meta-item"><label>Арендодатель</label><span>3X Media Cloud, ИНН: __________</span></div>
    <div class="meta-item"><label>Арендатор</label><span>${meta.renter_name || c.project || "—"}</span></div>
    <div class="meta-item"><label>Тип арендатора</label><span>${meta.renter_type || "—"}</span></div>
    <div class="meta-item"><label>Проект</label><span>${c.project || "—"}</span></div>
    <div class="meta-item"><label>Начало аренды</label><span>${c.start_date ? new Date(c.start_date).toLocaleDateString("ru-RU") : "—"}</span></div>
    <div class="meta-item"><label>Окончание аренды</label><span>${c.end_date ? new Date(c.end_date).toLocaleDateString("ru-RU") : "—"}</span></div>
  </div>

  <h2>Состав аренды</h2>
  <table>
    <thead><tr><th>Наименование</th><th style="text-align:right">Цена/сут</th><th style="text-align:right">Дней</th><th style="text-align:right">Сумма</th></tr></thead>
    <tbody>
      ${itemsRows || '<tr><td colspan="4" style="color:#94a3b8;text-align:center">Нет позиций</td></tr>'}
      <tr class="total-row">
        <td colspan="3">ИТОГО</td>
        <td style="text-align:right">${(c.total_price || 0).toLocaleString("ru-RU")} ₽</td>
      </tr>
    </tbody>
  </table>

  <h2>Условия</h2>
  <p style="line-height:1.7;color:#475569;margin-bottom:8px">
    Арендатор обязуется вернуть имущество в том же состоянии, в котором оно было получено, в установленный срок.
    В случае повреждения или утраты арендатор несёт полную материальную ответственность по рыночной стоимости.
    Оплата производится до начала аренды. При возврате составляется акт приёма-передачи.
  </p>

  <div class="sigs">
    <div class="sig-block">
      <label>Арендодатель</label>
      <div style="border-bottom:1px solid #000;height:50px;margin-top:8px"></div>
      <div class="name">3X Media Cloud</div>
    </div>
    <div class="sig-block">
      <label>Арендатор ${c.status === "signed" ? "· ✓ Подписан " + new Date(c.signed_at).toLocaleDateString("ru-RU") : ""}</label>
      ${signatureImg}
      <div class="name">${meta.renter_name || "—"}</div>
    </div>
  </div>

  <script>window.onload=()=>window.print()</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
