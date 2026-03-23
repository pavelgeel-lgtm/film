import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import IssueModal from "../modals/IssueModal";
import ReturnModal from "../modals/ReturnModal";
import { apiFetch } from "../api";
import { ITEMS, REQUESTS_INIT } from "../constants";

export default function WarehouseView() {
  const [requests, setRequests] = useState(REQUESTS_INIT);
  const [issued, setIssued] = useState(
    ITEMS.filter(i => i.status === "Выдан").map(i => ({ id: i.id, item: i.id, itemName: i.name, who: i.issuedTo, date: i.returnDate, status: "issued" }))
  );
  const [issueModal, setIssueModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [tab, setTab] = useState("requests");

  useEffect(() => {
    apiFetch("/requests").then(rows => {
      setRequests(rows.map(r => ({
        id: r.id, item: r.item_id, itemName: r.item_name || r.item_name_free || "—",
        who: r.requested_by_name || "—", role: r.requested_by_role || "",
        project: r.project || "", scene: r.scene || "", date: r.needed_by || "", status: r.status,
      })));
    }).catch(() => {});
    apiFetch("/issuances").then(rows => {
      setIssued(rows.map(r => ({
        id: r.id, item: r.item_id, itemName: r.item_name || "—",
        who: r.issued_to_name || "—", date: r.return_date || "", status: "issued",
      })));
    }).catch(() => {});
  }, []);

  const newReqs = requests.filter(r => r.status === "new");
  const confirmReqs = requests.filter(r => r.status === "confirmed");

  const doIssue = id => setRequests(p => p.map(r => r.id === id ? { ...r, status: "issued" } : r));
  const doReturn = id => setIssued(p => p.filter(r => r.id !== id));

  const confirm = async (id) => {
    setRequests(p => p.map(r => r.id === id ? { ...r, status: "confirmed" } : r));
    apiFetch(`/requests/${id}`, { method: "PATCH", body: { status: "confirmed" } }).catch(() => {
      setRequests(p => p.map(r => r.id === id ? { ...r, status: "new" } : r));
    });
  };

  const wStats = [
    { c: "#dc2626", bg: "#fee2e2", n: newReqs.length,    l: "Новых запросов" },
    { c: "#d97706", bg: "#fef3c7", n: confirmReqs.length, l: "Ожидают выдачи" },
    { c: "#16a34a", bg: "#dcfce7", n: issued.length,      l: "На руках" },
    { c: "#00AEEF", bg: "#E6F7FD", n: ITEMS.filter(i => i.status === "На складе").length, l: "На складе" },
  ];

  return (
    <div>
      <div className="wh-stats">
        {wStats.map(s => (
          <div key={s.l} style={{ background: s.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${s.c}33` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c, letterSpacing: "-1px", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 11.5, color: s.c, fontWeight: 700, marginTop: 3, opacity: .8 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,.07)", marginBottom: 14 }}>
        {[["requests", "Запросы с площадки", newReqs.length], ["issued", "Выдано — ожидаем возврат", issued.length]].map(([id, lbl, cnt]) => (
          <button key={id} className={`stab ${tab === id ? "on" : ""}`} style={{ fontFamily: "'Manrope',sans-serif" }} onClick={() => setTab(id)}>
            {lbl}
            {cnt > 0 && <span style={{ marginLeft: 6, background: tab === id ? "rgba(255,255,255,.3)" : "#fee2e2", color: tab === id ? "#fff" : "#dc2626", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20 }}>{cnt}</span>}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <div>
          {requests.filter(r => r.status !== "issued").length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>Нет активных запросов</div>
          )}
          {requests.filter(r => r.status !== "issued").map(r => (
            <div key={r.id} className="req-row" style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,.08)", padding: "14px 16px", marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: r.status === "new" ? "#fee2e2" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon n="box" s={18} c={r.status === "new" ? "#dc2626" : "#d97706"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{r.itemName}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{r.who} · {r.role} · Сцена {r.scene} · {r.date}</div>
              </div>
              <Pill s={r.status === "new" ? "Нет" : r.status === "confirmed" ? "Зарезервирован" : "Выдан"} />
              {r.status === "new" && <button className="btn bg sm" onClick={() => confirm(r.id)}>Подтвердить</button>}
              {r.status === "confirmed" && <button className="btn bp sm" onClick={() => setIssueModal(r)}><Icon n="ul" s={13} c="#fff" />Выдать</button>}
            </div>
          ))}
        </div>
      )}

      {tab === "issued" && (
        <div>
          {issued.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>Всё возвращено</div>}
          {issued.map(r => (
            <div key={r.id} className="req-row" style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,.08)", padding: "14px 16px", marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon n="ul" s={18} c="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{r.itemName}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  У: {r.who} · Вернуть до: <span style={{ color: "#dc2626", fontWeight: 700 }}>{r.date}</span>
                </div>
              </div>
              <button className="btn bg sm" onClick={() => setReturnModal(r)}><Icon n="dl" s={13} />Принять возврат</button>
            </div>
          ))}
        </div>
      )}

      {issueModal && <IssueModal req={issueModal} onClose={() => setIssueModal(null)} onIssue={doIssue} />}
      {returnModal && <ReturnModal issue={returnModal} onClose={() => setReturnModal(null)} onReturn={doReturn} />}
    </div>
  );
}
