import { useState } from "react";
import Icon from "../components/Icon";
import SignaturePad from "../components/SignaturePad";
import { apiFetch, API } from "../api";

export default function RentalModal({ rental, onClose, onSigned }) {
  const [sigMode, setSigMode] = useState(false);
  const [sig, setSig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const isSigned = rental.status === "signed" || rental.signed_at;

  const openPrint = () => window.open(`${API}/contracts/${rental.id || rental._id}/print`, "_blank");

  const doSign = async () => {
    if (!sig) { setErr("Необходима подпись"); return; }
    setLoading(true);
    setErr(null);
    try {
      const updated = await apiFetch(`/contracts/${rental.id}/sign`, { method: "POST", body: { signature: sig } });
      onSigned?.(updated);
      onClose();
    } catch (e) {
      setErr(e?.error || "Ошибка");
      setLoading(false);
    }
  };

  const meta = rental.meta_json || {};
  const items = meta.items || rental.items || [];
  const days = rental.days || (rental.start_date && rental.end_date
    ? Math.max(1, Math.ceil((new Date(rental.end_date) - new Date(rental.start_date)) / 86400000))
    : 1);

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>ДОГОВОР АРЕНДЫ</div>
            <div className="mtitle">{meta.renter_name || rental.renter || rental.project}</div>
            <div className="mid">{rental.id}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isSigned && <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>✓ Подписан</span>}
            <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
          </div>
        </div>
        <div className="mbody">
          {!sigMode ? (
            <>
              <div className="mgrid">
                {[
                  ["Арендатор", meta.renter_name || rental.renter || rental.project],
                  ["Тип", meta.renter_type || rental.type || "—"],
                  ["Начало", rental.start || rental.start_date],
                  ["Конец", rental.end || rental.end_date],
                  ["Дней", days],
                  ["Статус", rental.status || "draft"],
                ].map(([l, v]) => <div key={l}><div className="mfl">{l}</div><div className="mfv">{v || "—"}</div></div>)}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>СОСТАВ АРЕНДЫ</div>
              <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid rgba(0,0,0,.07)", overflow: "hidden", marginBottom: 14 }}>
                {items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < items.length - 1 ? "1px solid rgba(0,0,0,.05)" : "none" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{it.name || it.item}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#00AEEF", fontWeight: 700 }}>{(it.price || 0).toLocaleString()} руб/сут</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "#f1f5f9", borderTop: "2px solid rgba(0,0,0,.07)" }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Итого за {days} дней</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#00AEEF" }}>{(rental.total || rental.total_price || 0).toLocaleString()} руб</span>
                </div>
              </div>

              <div className="mact">
                <button className="btn bp sm" onClick={openPrint}><Icon n="doc" s={13} c="#fff" />Печать / PDF</button>
                {!isSigned && (
                  <button className="btn bg sm" style={{ background: "#7c3aed", color: "#fff", border: "none" }} onClick={() => setSigMode(true)}>
                    <Icon n="edit" s={13} c="#fff" />Подписать
                  </button>
                )}
                <button className="btn bg sm"><Icon n="edit" s={13} />Редактировать</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd", padding: "12px 14px", marginBottom: 14, fontSize: 13, color: "#0369a1", fontWeight: 600 }}>
                Подпись арендатора будет встроена в договор и сохранена в системе.
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>
                ПОДПИСЬ АРЕНДАТОРА — {meta.renter_name || rental.renter}
              </div>
              <SignaturePad onSave={setSig} />
              {sig && <div className="banner-ok" style={{ marginTop: 8 }}>✓ Подпись получена</div>}
              {err && <div className="banner-err" style={{ marginTop: 8 }}>{err}</div>}
              <div className="mact" style={{ marginTop: 14 }}>
                <button className="btn bp" onClick={doSign} disabled={!sig || loading}>
                  {loading ? <Icon n="clk" s={14} c="#fff" /> : <Icon n="chk" s={14} c="#fff" />}
                  {loading ? "Сохраняем..." : "Сохранить подпись"}
                </button>
                <button className="btn bg" onClick={() => { setSigMode(false); setErr(null); }}>Назад</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
