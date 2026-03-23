import { useState } from "react";
import Icon from "../components/Icon";
import Cell from "../components/Cell";
import SignaturePad from "../components/SignaturePad";
import PhotoUploader from "../components/PhotoUploader";
import { apiFetch } from "../api";
import { ITEMS } from "../constants";
import Portal from "../components/Portal";

export default function ReturnModal({ issue, onClose, onReturn }) {
  const item = ITEMS.find(i => i.id === issue.item);
  const [cond, setCond] = useState("Хорошее");
  const [damaged, setDamaged] = useState(false);
  const [sig, setSig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const doReturn = async () => {
    if (!sig) { setErr("Необходима подпись"); return; }
    setLoading(true);
    setErr(null);
    try {
      await apiFetch(`/issuances/${issue.id}/return`, { method: "POST", body: { condition_at_return: cond, damaged, signature: sig } });
      onReturn(issue.id);
      onClose();
    } catch (e) {
      setErr(e?.error || "Ошибка");
      setLoading(false);
    }
  };

  return (
    <Portal><div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>ВОЗВРАТ РЕКВИЗИТА</div>
            <div className="mtitle">{issue.itemName}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "#fef3c7", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 4 }}>ВЫДАН БЫЛ</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{issue.who}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{issue.date}</div>
            </div>
            {item && (
              <div style={{ background: "rgba(124,58,237,.06)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 4 }}>ВЕРНУТЬ В ЯЧЕЙКУ</div>
                <Cell wh={item.wh} cell={item.cell} />
              </div>
            )}
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>ФОТО ПРИ ВОЗВРАТЕ</div>
          <div style={{ marginBottom: 14 }}>
            <PhotoUploader refType="item" refId={item?.id || 0} />
          </div>

          <div className="fg">
            <label className="fl">Состояние при возврате</label>
            <select className="fi" value={cond} onChange={e => setCond(e.target.value)}>
              {["Отлично", "Хорошее", "Удовлетворительное", "Повреждён"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "10px 12px", background: damaged ? "#fee2e2" : "#f8fafc", borderRadius: 8, cursor: "pointer", border: `1px solid ${damaged ? "#dc2626" : "rgba(0,0,0,.07)"}` }}
            onClick={() => setDamaged(p => !p)}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${damaged ? "#dc2626" : "#cbd5e1"}`, background: damaged ? "#dc2626" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {damaged && <Icon n="chk" s={12} c="#fff" />}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: damaged ? "#dc2626" : "#334155" }}>Обнаружены повреждения — создать задачу на ремонт</span>
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>ПОДПИСЬ СДАЮЩЕГО — {issue.who}</div>
          <SignaturePad onSave={setSig} />
          {sig && <div className="banner-ok" style={{ marginTop: 8 }}>✓ Подпись получена</div>}
          {err && <div className="banner-err" style={{ marginTop: 8 }}>{err}</div>}

          <div className="mact" style={{ marginTop: 14 }}>
            <button className="btn bp" onClick={doReturn} disabled={!sig || loading}>
              {loading ? <Icon n="clk" s={14} c="#fff" /> : <Icon n="dl" s={14} c="#fff" />}
              {loading ? "Сохраняем..." : "Принять возврат"}
            </button>
            <button className="btn bg" onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div></Portal>
  );
}
