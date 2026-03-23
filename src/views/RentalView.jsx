import { useState } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import RentalModal from "../modals/RentalModal";
import { apiFetch } from "../api";
import { RENTALS_INIT } from "../constants";

export default function RentalView() {
  const [rentals, setRentals] = useState(RENTALS_INIT);
  const [sel, setSel] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [nf, setNf] = useState({ renter: "", type: "Компания", item: "", price: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [newErr, setNewErr] = useState(null);

  const totalActive = rentals
    .filter(r => ["Активна", "active", "signed"].includes(r.status))
    .reduce((s, r) => s + (r.total || r.total_price || 0), 0);

  const calcDays = (s, e) => {
    try {
      const a = s.includes(".") ? s.split(".").reverse().join("-") : s;
      const b = e.includes(".") ? e.split(".").reverse().join("-") : e;
      const d = (new Date(b) - new Date(a)) / 86400000;
      return d > 0 ? Math.ceil(d) : 1;
    } catch { return 1; }
  };

  const statusPill = s => ({ draft: "Частично", signed: "Зарезервирован", active: "Выдан", completed: "Постоянный", "Активна": "Выдан", "Завершена": "Постоянный" }[s] || "Частично");

  const addRental = async () => {
    if (!nf.renter || !nf.item) { setNewErr("Заполните арендатора и предмет"); return; }
    const days = calcDays(nf.start || "2025-03-01", nf.end || "2025-03-07");
    const price = parseInt(nf.price) || 500;
    const total = days * price;
    setLoading(true);
    setNewErr(null);
    try {
      const r = await apiFetch("/contracts", { method: "POST", body: { renter_name: nf.renter, renter_type: nf.type, start_date: nf.start, end_date: nf.end, total_price: total, items: [{ name: nf.item, price }] } });
      setRentals(p => [r, ...p]);
    } catch {
      setRentals(p => [{ id: `RNT-${Date.now()}`, renter: nf.renter, type: nf.type, items: [{ name: nf.item, price }], start: nf.start, end: nf.end, days, total, status: "draft", payment: "Не оплачено" }, ...p]);
    } finally { setLoading(false); }
    setNf({ renter: "", type: "Компания", item: "", price: "", start: "", end: "" });
    setShowNew(false);
  };

  const onSigned = updated => setRentals(p => p.map(r => r.id === updated.id ? { ...r, ...updated } : r));

  const getRenter = r => { const m = r.meta_json || {}; return m.renter_name || r.renter || r.project || "—"; };
  const getType   = r => { const m = r.meta_json || {}; return m.renter_type || r.type || "—"; };
  const getItems  = r => { const m = r.meta_json || {}; return (m.items || r.items || []).map(i => i.name || i.item).join(", ") || "—"; };
  const getTotal  = r => r.total || r.total_price || 0;

  return (
    <div>
      <div className="rental-bar">
        {[
          { c: "#16a34a", bg: "#dcfce7", n: rentals.filter(r => ["Активна", "active", "signed"].includes(r.status)).length, l: "Активных аренд" },
          { c: "#00AEEF", bg: "#E6F7FD", n: `${totalActive.toLocaleString()} руб`, l: "В обороте" },
          { c: "#7c3aed", bg: "#ede9fe", n: rentals.filter(r => r.status === "signed").length, l: "Подписано" },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${s.c}33`, minWidth: 100 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, letterSpacing: "-.5px", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 11.5, color: s.c, fontWeight: 700, marginTop: 3, opacity: .8 }}>{s.l}</div>
          </div>
        ))}
        <button className="btn bp" onClick={() => setShowNew(true)}><Icon n="plus" s={14} c="#fff" />Новая аренда</button>
      </div>

      <div className="card">
        <div className="ch"><span className="ct">Все договора аренды</span><span className="cs">нажмите строку для деталей</span></div>
        <table className="tbl">
          <thead><tr><th>ID</th><th>Арендатор</th><th>Предметы</th><th>Период</th><th>Сумма</th><th>Статус</th></tr></thead>
          <tbody>
            {rentals.map(r => (
              <tr key={r.id} onClick={() => setSel(r)}>
                <td><span className="idc">{r.id}</span></td>
                <td><div style={{ fontWeight: 700 }}>{getRenter(r)}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{getType(r)}</div></td>
                <td style={{ color: "#334155", fontSize: 12.5, maxWidth: 180 }}>{getItems(r)}</td>
                <td style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>{r.start || r.start_date} — {r.end || r.end_date}<br /><span style={{ color: "#94a3b8" }}>{r.days} дн.</span></td>
                <td style={{ fontWeight: 800, color: "#00AEEF", fontFamily: "'JetBrains Mono',monospace" }}>{getTotal(r).toLocaleString()} руб</td>
                <td>
                  {r.status === "signed"
                    ? <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>✓ Подписан</span>
                    : <Pill s={statusPill(r.status)} />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <RentalModal rental={sel} onClose={() => setSel(null)} onSigned={onSigned} />}

      {showNew && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal">
            <div className="mtop">
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>НОВАЯ АРЕНДА</div>
                <div className="mtitle">Оформить договор</div>
              </div>
              <button className="xbtn" onClick={() => setShowNew(false)}><Icon n="x" s={15} /></button>
            </div>
            <div className="mbody">
              <div className="frow">
                <div className="fg">
                  <label className="fl">Арендатор</label>
                  <input className="fi" placeholder="Кинокомпания / ФИО" value={nf.renter} onChange={e => setNf(p => ({ ...p, renter: e.target.value }))} />
                </div>
                <div className="fg">
                  <label className="fl">Тип</label>
                  <select className="fi" value={nf.type} onChange={e => setNf(p => ({ ...p, type: e.target.value }))}>
                    <option>Компания</option><option>Физлицо</option><option>Фотостудия</option><option>Другое</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label className="fl">Предмет аренды</label>
                <input className="fi" placeholder="Ваза напольная белая..." value={nf.item} onChange={e => setNf(p => ({ ...p, item: e.target.value }))} />
              </div>
              <div className="frow">
                <div className="fg">
                  <label className="fl">Цена за сутки (руб)</label>
                  <input className="fi" type="number" placeholder="800" value={nf.price} onChange={e => setNf(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="fg">
                  <label className="fl">Дата начала</label>
                  <input className="fi" type="date" value={nf.start} onChange={e => setNf(p => ({ ...p, start: e.target.value }))} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Дата возврата</label>
                <input className="fi" type="date" value={nf.end} onChange={e => setNf(p => ({ ...p, end: e.target.value }))} />
              </div>
              {nf.price && nf.start && nf.end && (
                <div style={{ background: "#E6F7FD", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontWeight: 700, color: "#0090C8", fontSize: 14 }}>
                  Итого: {(calcDays(nf.start, nf.end) * (parseInt(nf.price) || 0)).toLocaleString()} руб за {calcDays(nf.start, nf.end)} дней
                </div>
              )}
              {newErr && <div className="banner-err" style={{ marginBottom: 10 }}>{newErr}</div>}
              <div className="mact">
                <button className="btn bp" onClick={addRental} disabled={loading}>
                  <Icon n="save" s={14} c="#fff" />{loading ? "Создаём..." : "Создать договор"}
                </button>
                <button className="btn bg" onClick={() => setShowNew(false)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
