import { useState } from "react";
import Icon from "../components/Icon";
import Cell from "../components/Cell";
import SignaturePad from "../components/SignaturePad";
import PhotoUploader from "../components/PhotoUploader";
import { apiFetch } from "../api";
import { ITEMS } from "../constants";
import Portal from "../components/Portal";

export default function IssueModal({ req, onClose, onIssue }) {
  const item = ITEMS.find(i => i.id === req.item);
  const [step, setStep] = useState(1);
  const [cond, setCond] = useState("Отлично");
  const [sig, setSig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const doIssue = async () => {
    if (!sig) { setErr("Необходима подпись"); return; }
    setLoading(true);
    setErr(null);
    try {
      await apiFetch(`/requests/${req.id}/issue`, { method: "POST", body: { condition_at_issue: cond, signature: sig } });
      onIssue(req.id);
      onClose();
    } catch (e) {
      setErr(e?.error || "Ошибка");
      setLoading(false);
    }
  };

  const steps = ["Проверить", "Фото", "Подпись"];

  return (
    <Portal><div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>ВЫДАЧА РЕКВИЗИТА</div>
            <div className="mtitle">{req.itemName}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 7, background: step === i + 1 ? "#00AEEF" : step > i + 1 ? "#dcfce7" : "#f1f5f9", color: step === i + 1 ? "#fff" : step > i + 1 ? "#16a34a" : "#94a3b8", fontWeight: 700, fontSize: 12 }}>
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {step === 1 && <>
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid rgba(0,0,0,.07)", padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#94a3b8", marginBottom: 8 }}>ПОЛУЧАТЕЛЬ</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{req.who}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{req.role} · {req.project} · Сцена {req.scene}</div>
            </div>
            {item && (
              <div style={{ background: "rgba(124,58,237,.06)", borderRadius: 10, border: "1px solid rgba(124,58,237,.2)", padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#7c3aed", marginBottom: 6 }}>ЯЧЕЙКА</div>
                <Cell wh={item.wh} cell={item.cell} />
              </div>
            )}
            <div className="fg">
              <label className="fl">Состояние при выдаче</label>
              <select className="fi" value={cond} onChange={e => setCond(e.target.value)}>
                {["Отлично", "Хорошее", "Удовлетворительное", "Требует ремонта"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mact">
              <button className="btn bp" onClick={() => setStep(2)}>Далее — Фото</button>
              <button className="btn bg" onClick={onClose}>Отмена</button>
            </div>
          </>}

          {step === 2 && <>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>СФОТОГРАФИРУЙТЕ ПРЕДМЕТ ПЕРЕД ВЫДАЧЕЙ</div>
            <PhotoUploader refType="item" refId={item?.id || 0} />
            <div style={{ marginTop: 12 }} className="mact">
              <button className="btn bp" onClick={() => setStep(3)}>Далее — Подпись</button>
              <button className="btn bg" onClick={() => setStep(1)}>Назад</button>
            </div>
          </>}

          {step === 3 && <>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 10 }}>ПОДПИСЬ ПОЛУЧАТЕЛЯ — {req.who}</div>
            <SignaturePad onSave={setSig} />
            {sig && <div className="banner-ok" style={{ marginTop: 10 }}>✓ Подпись получена</div>}
            {err && <div className="banner-err" style={{ marginTop: 8 }}>{err}</div>}
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", marginTop: 12, marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>После выдачи:</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>· Ячейка {item?.cell} освобождается автоматически</div>
              <div style={{ fontSize: 13 }}>· Дедлайн возврата: {req.date}</div>
            </div>
            <div className="mact">
              <button className="btn bp" onClick={doIssue} disabled={!sig || loading}>
                {loading ? <Icon n="clk" s={14} c="#fff" /> : <Icon n="ul" s={14} c="#fff" />}
                {loading ? "Сохраняем..." : "Подтвердить выдачу"}
              </button>
              <button className="btn bg" onClick={() => setStep(2)}>Назад</button>
            </div>
          </>}
        </div>
      </div>
    </div></Portal>
  );
}
