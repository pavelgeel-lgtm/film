import { useState } from "react";
import Icon from "../components/Icon";
import SignaturePad from "../components/SignaturePad";
import { apiFetch } from "../api";

export default function ConfirmReceiptModal({ issuance, onClose, onConfirmed }) {
  const [sig, setSig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const doConfirm = async () => {
    if (!sig) { setErr("Необходима подпись"); return; }
    setLoading(true);
    setErr(null);
    try {
      await apiFetch(`/field/issuances/${issuance.id}/confirm`, { method: "POST", body: { signature: sig } });
      onConfirmed(issuance.id);
      onClose();
    } catch (e) {
      setErr(e?.error || "Ошибка");
      setLoading(false);
    }
  };

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>ПОДТВЕРЖДЕНИЕ ПОЛУЧЕНИЯ</div>
            <div className="mtitle">{issuance.item_name || issuance.name}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div style={{ background: "#fef3c7", borderRadius: 10, border: "1px solid #d97706", padding: "12px 14px", marginBottom: 14, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
            Подпишите, что получили предмет в надлежащем состоянии. Подпись сохраняется в системе.
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>ВАША ПОДПИСЬ</div>
          <SignaturePad onSave={setSig} />
          {sig && <div className="banner-ok" style={{ marginTop: 8 }}>✓ Подпись получена</div>}
          {err && <div className="banner-err" style={{ marginTop: 8 }}>{err}</div>}
          <div className="mact" style={{ marginTop: 14 }}>
            <button className="btn bp" onClick={doConfirm} disabled={!sig || loading}>
              {loading ? <Icon n="clk" s={14} c="#fff" /> : <Icon n="chk" s={14} c="#fff" />}
              {loading ? "Сохраняем..." : "Подтвердить получение"}
            </button>
            <button className="btn bg" onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  );
}
