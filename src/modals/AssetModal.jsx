import { useState } from "react";
import Icon from "../components/Icon";
import Portal from "../components/Portal";
import { apiFetch } from "../api";

export default function AssetModal({ item, onClose, fields, btnLabel = "Запросить" }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project: "", scene: "", date: "", comment: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.project.trim()) { setResult({ ok: false, text: "Укажите проект" }); return; }
    setLoading(true);
    setResult(null);
    try {
      await apiFetch("/field/requests", {
        method: "POST",
        body: {
          item_id: item.id,
          item_name_free: item.name,
          project: form.project,
          scene: form.scene,
          needed_by: form.date,
          comment: form.comment,
        },
      });
      setResult({ ok: true, text: `Запрос на "${item.name}" отправлен` });
      setTimeout(() => { setShowForm(false); setResult(null); onClose(); }, 1500);
    } catch (e) {
      setResult({ ok: false, text: e?.error || "Ошибка отправки запроса" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div className="mtitle">{item.name}</div>
            <div className="mid">{item.id}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          {!showForm ? (
            <>
              <div className="mgrid">
                {fields.map(([l, v]) => (
                  <div key={l}><div className="mfl">{l}</div><div className="mfv">{v}</div></div>
                ))}
              </div>
              {item.limits && (
                <div className="ibox" style={{ background: "#fee2e2", borderColor: "#dc2626" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#dc2626", marginBottom: 3 }}>ОГРАНИЧЕНИЯ</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.limits}</div>
                </div>
              )}
              {item.inventory && (
                <div>
                  <div className="mfl" style={{ marginBottom: 6 }}>ЧТО ЕСТЬ НА ЛОКАЦИИ</div>
                  <div style={{ background: "#f8f8fc", borderRadius: 10, border: "1px solid rgba(0,0,0,.05)", padding: "11px 14px", fontSize: 12.5, color: "#334155", lineHeight: 1.75, fontWeight: 500, marginBottom: 12 }}>{item.inventory}</div>
                </div>
              )}
              <div className="mfl" style={{ marginBottom: 7 }}>ИСТОРИЯ В ПРОЕКТАХ</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                {item.history?.map(h => (
                  <span key={h} style={{ background: "#E6F7FD", color: "#00AEEF", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 7 }}>{h}</span>
                ))}
              </div>
              <div className="mfl" style={{ marginBottom: 7 }}>ФОТОГРАФИИ ({item.photos})</div>
              <div className="pgrid">
                {Array.from({ length: Math.min(item.photos, 6) }).map((_, i) => (
                  <div key={i} className="pph">
                    <Icon n="img" s={20} c="#d1d5db" />
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8" }}>Фото {i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mact">
                <button className="btn bp sm" onClick={() => setShowForm(true)}>
                  <Icon n="send" s={13} c="#fff" />{btnLabel}
                </button>
                <button className="btn bg sm"><Icon n="edit" s={13} />Ред.</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 12 }}>
                {btnLabel.toUpperCase()} — {item.name}
              </div>
              <div className="fg">
                <label className="fl">Проект *</label>
                <input className="fi" placeholder="НАШ СПЕЦНАЗ-4" value={form.project} onChange={set("project")} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div className="fg">
                  <label className="fl">Сцена</label>
                  <input className="fi" placeholder="46-1" value={form.scene} onChange={set("scene")} />
                </div>
                <div className="fg">
                  <label className="fl">Нужно к</label>
                  <input className="fi" type="date" value={form.date} onChange={set("date")} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Комментарий</label>
                <input className="fi" placeholder="Дополнительные условия..." value={form.comment} onChange={set("comment")} />
              </div>
              {result && (
                <div className={result.ok ? "banner-ok" : "banner-err"} style={{ marginBottom: 10 }}>
                  {result.ok ? "✓ " : ""}{result.text}
                </div>
              )}
              <div className="mact">
                <button className="btn bp" onClick={submit} disabled={loading}>
                  <Icon n="send" s={14} c="#fff" />
                  {loading ? "Отправляем..." : "Отправить запрос"}
                </button>
                <button className="btn bg" onClick={() => { setShowForm(false); setResult(null); }}>Назад</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
