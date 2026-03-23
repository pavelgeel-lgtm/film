import Icon from "../components/Icon";
import Cell from "../components/Cell";
import { ITEMS } from "../constants";

export default function NotifModal({ n, onClose }) {
  const item = ITEMS.find(i => i.id === n.itemId);
  const lc = {
    crit: { bg: "#fee2e2", bc: "#dc2626", lbl: "КРИТИЧЕСКОЕ", c: "#dc2626" },
    warn: { bg: "#fef3c7", bc: "#d97706", lbl: "ПРЕДУПРЕЖДЕНИЕ", c: "#d97706" },
    info: { bg: "#E6F7FD", bc: "#00AEEF", lbl: "ИНФОРМАЦИЯ", c: "#00AEEF" },
  }[n.lv];

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: lc.c, marginBottom: 4 }}>{lc.lbl}</div>
            <div className="mtitle">{n.title}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div className="mfl" style={{ marginBottom: 7 }}>ПРЕДМЕТ</div>
          <div style={{ background: "#f8f8fc", borderRadius: 10, border: "1px solid rgba(0,0,0,.05)", padding: "11px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#E6F7FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon n="box" s={18} c="#00AEEF" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{n.itemName}</div>
              <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: "#94a3b8", marginTop: 1 }}>{n.itemId}</div>
            </div>
            {item && <Cell wh={item.wh} cell={item.cell} />}
          </div>

          <div className="mfl" style={{ marginBottom: 7 }}>У КОГО НАХОДИТСЯ</div>
          <div style={{ background: "#f8f8fc", borderRadius: 10, border: "1px solid rgba(0,0,0,.05)", padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#00AEEF,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{n.who.slice(0, 2)}</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{n.who}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{n.role} · {n.project}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <div className="mfl">ТЕЛЕФОН</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>
                  <a href={`tel:${n.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{n.phone}</a>
                </div>
              </div>
              <div>
                <div className="mfl">ВЕРНУТЬ ДО</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: n.lv === "crit" ? "#dc2626" : n.lv === "warn" ? "#d97706" : "#0f172a" }}>{n.returnDate}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${n.phone}`} className="cbtn" style={{ background: "#dcfce7", color: "#16a34a", textDecoration: "none" }}>
                <Icon n="phone" s={15} c="#16a34a" />Позвонить
              </a>
            </div>
          </div>

          {n.lv !== "info" && (
            <div className="ibox" style={{ background: lc.bg, borderColor: lc.bc }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: lc.c, marginBottom: 3 }}>ТРЕБУЕТСЯ ДЕЙСТВИЕ</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {n.lv === "crit" ? "Свяжитесь с получателем и потребуйте немедленного возврата." : `Напомните о возврате. Срок: ${n.returnDate}`}
              </div>
            </div>
          )}
          <div className="mact">
            <button className="btn bp sm"><Icon n="chk" s={13} c="#fff" />Решить</button>
            <button className="btn bg sm" onClick={onClose}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  );
}
