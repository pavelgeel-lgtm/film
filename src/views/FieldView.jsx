import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import ConfirmReceiptModal from "../modals/ConfirmReceiptModal";
import { apiFetch } from "../api";

export default function FieldView({ user }) {
  const [myItems, setMyItems] = useState([
    { id: 1, item_name: "Ваза напольная белая, керамика h=60см", return_date: "01.03.2025", receipt_confirmed_at: "2025-01-01" },
    { id: 2, item_name: "Форма СОБР, комплект №2", return_date: "01.03.2025", receipt_confirmed_at: null },
  ]);
  const [requests, setRequests] = useState([
    { id: 1, item_name_free: "Носилки складные",          scene: "46-1", needed_by: "10.03.2025", status: "new" },
    { id: 2, item_name_free: "Флаг российский напольный", scene: "46-9", needed_by: "11.03.2025", status: "confirmed" },
  ]);
  const [showReq, setShowReq] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [newReq, setNewReq] = useState({ name: "", scene: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [reqErr, setReqErr] = useState(null);

  useEffect(() => {
    apiFetch("/field/issuances").then(rows => setMyItems(rows)).catch(() => {});
    apiFetch("/field/requests").then(rows => setRequests(rows)).catch(() => {});
  }, []);

  const statusPill = s => ({ new: "Частично", confirmed: "Зарезервирован", rejected: "Нет", issued: "На складе" }[s] || "Частично");
  const onConfirmed = id => setMyItems(p => p.map(i => i.id === id ? { ...i, receipt_confirmed_at: new Date().toISOString() } : i));

  const addReq = async () => {
    if (!newReq.name.trim()) { setReqErr("Введите название"); return; }
    setLoading(true);
    setReqErr(null);
    try {
      const r = await apiFetch("/field/requests", { method: "POST", body: { item_name_free: newReq.name, scene: newReq.scene, needed_by: newReq.date } });
      setRequests(p => [r, ...p]);
      setNewReq({ name: "", scene: "", date: "" });
      setShowReq(false);
    } catch {
      setRequests(p => [{ id: Date.now(), item_name_free: newReq.name, scene: newReq.scene, needed_by: newReq.date, status: "new" }, ...p]);
      setNewReq({ name: "", scene: "", date: "" });
      setShowReq(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#7c3aed)", borderRadius: 14, padding: "16px 20px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="user" s={22} c="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{user?.name || "—"}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{user?.role || ""}</div>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 12px" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>На руках</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{myItems.length}</div>
        </div>
      </div>

      <div className="field-g" style={{ display: "grid", gap: 12, marginBottom: 14 }}>
        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 10 }}>МОЙ РЕКВИЗИТ</div>
          {myItems.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Ничего на руках</div>}
          {myItems.map(i => (
            <div key={i.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{i.item_name}</div>
              <div className="field-item-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, color: "#dc2626", fontWeight: 700 }}>Вернуть до {i.return_date}</span>
                {!i.receipt_confirmed_at
                  ? <button className="btn bp sm" style={{ fontSize: 11 }} onClick={() => setConfirmModal(i)}><Icon n="chk" s={12} c="#fff" />Подтвердить получение</button>
                  : <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 700 }}>✓ Получено</span>
                }
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8" }}>МОИ ЗАПРОСЫ</div>
            <button className="btn bp sm" style={{ fontSize: 11 }} onClick={() => setShowReq(true)}><Icon n="plus" s={12} c="#fff" />Новый</button>
          </div>
          {requests.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Нет запросов</div>}
          {requests.map(r => (
            <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.item_name || r.item_name_free}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Сцена {r.scene} · {r.needed_by}</span>
                <Pill s={statusPill(r.status)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showReq && (
        <div className="ov" onClick={e => e.target === e.currentTarget && setShowReq(false)}>
          <div className="modal">
            <div className="mtop">
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>НОВЫЙ ЗАПРОС</div>
                <div className="mtitle">Запросить реквизит</div>
              </div>
              <button className="xbtn" onClick={() => setShowReq(false)}><Icon n="x" s={15} /></button>
            </div>
            <div className="mbody">
              <div className="fg">
                <label className="fl">Что нужно</label>
                <input className="fi" placeholder="Название предмета..." value={newReq.name} onChange={e => setNewReq(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="fg">
                  <label className="fl">Сцена</label>
                  <input className="fi" placeholder="46-1" value={newReq.scene} onChange={e => setNewReq(p => ({ ...p, scene: e.target.value }))} />
                </div>
                <div className="fg">
                  <label className="fl">Нужно к</label>
                  <input className="fi" type="date" value={newReq.date} onChange={e => setNewReq(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              {reqErr && <div className="banner-err" style={{ marginBottom: 10 }}>{reqErr}</div>}
              <div className="mact">
                <button className="btn bp" onClick={addReq} disabled={loading}>
                  <Icon n="send" s={14} c="#fff" />{loading ? "Отправляем..." : "Отправить запрос"}
                </button>
                <button className="btn bg" onClick={() => setShowReq(false)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && <ConfirmReceiptModal issuance={confirmModal} onClose={() => setConfirmModal(null)} onConfirmed={onConfirmed} />}
    </div>
  );
}
