import { useState } from "react";
import Icon from "../components/Icon";

export default function SceneEditModal({ scene, onSave, onClose }) {
  const [f, setF] = useState({ loc: scene.loc, date: scene.date, time: scene.time, dur: scene.dur, desc: scene.desc });
  const [items, setItems] = useState(scene.items.map(x => ({ ...x })));
  const [makeup, setMakeup] = useState(scene.makeup.map(x => ({ ...x })));

  const upd = (k, v) => setF(p => ({ ...p, [k]: v }));
  const updI = (i, k, v) => setItems(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const delI = i => setItems(p => p.filter((_, j) => j !== i));
  const updM = (i, k, v) => setMakeup(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const delM = i => setMakeup(p => p.filter((_, j) => j !== i));
  const save = () => { onSave({ ...scene, ...f, items, makeup }); onClose(); };

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>РЕДАКТИРОВАТЬ СЦЕНУ</div>
            <div className="mtitle">Сцена {scene.id}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>ОСНОВНОЕ</div>
          <div className="frow" style={{ marginBottom: 0 }}>
            <div className="fg"><label className="fl">Локация</label><input className="fi" value={f.loc} onChange={e => upd("loc", e.target.value)} /></div>
            <div className="fg"><label className="fl">Описание</label><input className="fi" value={f.desc} onChange={e => upd("desc", e.target.value)} /></div>
          </div>
          <div className="mgrid3" style={{ marginBottom: 14 }}>
            <div><label className="fl">Дата</label><input className="fi" value={f.date} onChange={e => upd("date", e.target.value)} /></div>
            <div><label className="fl">Время начала</label><input className="fi" value={f.time} onChange={e => upd("time", e.target.value)} /></div>
            <div><label className="fl">Хронометраж</label><input className="fi" value={f.dur} onChange={e => upd("dur", e.target.value)} /></div>
          </div>

          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>РЕКВИЗИТ И КОСТЮМЫ</div>
          {items.map((it, i) => (
            <div key={i} className="erow">
              <select className="fi" style={{ minWidth: 80, flex: "1 1 80px" }} value={it.dept} onChange={e => updI(i, "dept", e.target.value)}>
                <option>реквизит</option><option>костюм</option><option>транспорт</option>
              </select>
              <input className="fi" value={it.name} onChange={e => updI(i, "name", e.target.value)} />
              <select className="fi" style={{ minWidth: 100, flex: "2 1 100px" }} value={it.status} onChange={e => updI(i, "status", e.target.value)}>
                {["На складе", "Постоянный", "Частично", "Нет", "Изготовить", "Сделать", "Поставщик"].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="btn br sm" style={{ padding: "5px 8px", flex: "none" }} onClick={() => delI(i)}>
                <Icon n="trash" s={13} c="#dc2626" />
              </button>
            </div>
          ))}
          <button className="btn bg sm" style={{ marginBottom: 14 }} onClick={() => setItems(p => [...p, { name: "Новая позиция", dept: "реквизит", status: "На складе", note: "" }])}>
            <Icon n="plus" s={13} />Добавить позицию
          </button>

          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px", color: "#94a3b8", marginBottom: 8 }}>ГРИМ</div>
          {makeup.map((m, i) => (
            <div key={i} className="erow">
              <input className="fi" placeholder="Персонаж" value={m.char} onChange={e => updM(i, "char", e.target.value)} />
              <input className="fi" placeholder="Актёр" value={m.actor} onChange={e => updM(i, "actor", e.target.value)} />
              <input className="fi" placeholder="Описание грима" value={m.look} onChange={e => updM(i, "look", e.target.value)} />
              <button className="btn br sm" style={{ padding: "5px 8px", flex: "none" }} onClick={() => delM(i)}>
                <Icon n="trash" s={13} c="#dc2626" />
              </button>
            </div>
          ))}
          <button className="btn bg sm" style={{ marginBottom: 14 }} onClick={() => setMakeup(p => [...p, { char: "", actor: "", look: "", cont: "-" }])}>
            <Icon n="plus" s={13} />Добавить грим
          </button>

          <div className="mact">
            <button className="btn bp" onClick={save}><Icon n="save" s={14} c="#fff" />Сохранить изменения</button>
            <button className="btn bg" onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  );
}
