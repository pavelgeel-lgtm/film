import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import NotifModal from "../modals/NotifModal";
import { apiFetch } from "../api";
import { NOTIFS } from "../constants";

export default function NotifsView() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    apiFetch("/notifications").then(rows => {
      if (rows.length > 0) setNotifs(rows.map(r => ({
        id: r.id, lv: r.level || "info",
        ico: r.level === "crit" ? "alert" : r.level === "warn" ? "clk" : "bell",
        title: r.title, body: r.body, who: r.who || "", role: r.role || "",
        project: r.project || "", time: r.created_at ? new Date(r.created_at).toLocaleDateString("ru") : "",
        is_read: r.is_read,
      })));
    }).catch(() => {});
  }, []);

  const markRead = async (id, e) => {
    e.stopPropagation();
    apiFetch(`/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
    setNotifs(p => p.filter(n => n.id !== id));
  };

  const crit = notifs.filter(n => n.lv === "crit").length;
  const warn = notifs.filter(n => n.lv === "warn").length;
  const info = notifs.filter(n => !["crit", "warn"].includes(n.lv)).length;

  const statCfg = [
    ["#dc2626", "#fee2e2", "alert", "Критические",      crit],
    ["#d97706", "#fef3c7", "clk",   "Предупреждения",   warn],
    ["#00AEEF", "#E6F7FD", "bell",  "Информационные",   info],
  ];
  const notifCfg = { crit: { bg: "rgba(220,38,38,.09)", c: "#dc2626" }, warn: { bg: "rgba(217,119,6,.09)", c: "#d97706" }, info: { bg: "rgba(37,99,235,.08)", c: "#00AEEF" } };

  return (
    <div>
      <div className="notif-stats">
        {statCfg.map(([tc, bg, ico, lb, ct]) => (
          <div key={lb} style={{ background: bg, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", border: `1px solid ${tc}33` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: tc + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n={ico} s={18} c={tc} />
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: tc, letterSpacing: "-1px", lineHeight: 1 }}>{ct}</div>
              <div style={{ fontSize: 12, color: tc, opacity: .75, marginTop: 2, fontWeight: 700 }}>{lb}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ch"><span className="ct">Все уведомления</span><span className="cs">нажмите — откроется карточка</span></div>
        {notifs.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontWeight: 600 }}>Нет уведомлений</div>}
        {notifs.map(n => {
          const cfg = notifCfg[n.lv] || notifCfg.info;
          return (
            <div key={n.id} className="nr" onClick={() => setSel(n)}>
              <div className="ni2" style={{ background: cfg.bg }}><Icon n={n.ico} s={16} c={cfg.c} /></div>
              <div style={{ flex: 1 }}>
                <div className="ntt">{n.title}</div>
                <div className="nb">{n.body}</div>
                <div className="nm">
                  <span>{n.who}</span>
                  {n.role && <><span>·</span><span>{n.role}</span></>}
                  {n.project && <><span>·</span><span>{n.project}</span></>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
                <span className="ntm">{n.time}</span>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn bg sm" onClick={e => markRead(n.id, e)}>Закрыть</button>
                  <button className="btn bp sm" onClick={e => { e.stopPropagation(); setSel(n); }}>Открыть</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sel && <NotifModal n={sel} onClose={() => setSel(null)} />}
    </div>
  );
}
