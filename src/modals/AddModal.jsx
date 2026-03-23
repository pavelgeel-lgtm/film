import { useState } from "react";
import Icon from "../components/Icon";
import { apiFetch } from "../api";
import Portal from "../components/Portal";

export default function AddModal({ onClose, onAdded }) {
  const [f, setF] = useState({ type: "PRO", cat: "Декор", name: "", wh: "Склад А", cell: "", origin: "Закупка", val: "", unique: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!f.name.trim()) { setErr("Введите название"); return; }
    setLoading(true);
    setErr(null);
    const prefix = f.type === "PRO" ? "PRO" : "COS";
    const code = `${prefix}-${Date.now().toString().slice(-5)}`;
    try {
      const item = await apiFetch("/items", {
        method: "POST",
        body: { code, name: f.name, category: f.cat, condition: "Хорошее", value: parseInt(f.val) || 0, origin: f.origin, unique_marks: f.unique, warehouse: f.wh, cell: f.cell },
      });
      onAdded?.(item);
      onClose();
    } catch (e) {
      setErr(e?.error || "Ошибка сохранения");
      setLoading(false);
    }
  };

  return (
    <Portal><div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 3 }}>НОВАЯ ЕДИНИЦА</div>
            <div className="mtitle">Поставить на учёт</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mbody">
          <div className="frow">
            <div className="fg">
              <label className="fl">Тип базы</label>
              <select className="fi" value={f.type} onChange={set("type")}>
                <option value="PRO">Реквизит (PRO)</option>
                <option value="COS">Костюм (COS)</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Категория</label>
              <select className="fi" value={f.cat} onChange={set("cat")}>
                {["Декор", "Мебель", "Техника", "Оружие/бутафория", "Форма/мундир", "Медоборудование", "Документы"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="fg">
            <label className="fl">Название</label>
            <input className="fi" placeholder="Ваза напольная, белая, керамика h=60 см" value={f.name} onChange={set("name")} />
          </div>
          <div className="frow">
            <div className="fg">
              <label className="fl">Склад</label>
              <select className="fi" value={f.wh} onChange={set("wh")}>
                <option>Склад А</option><option>Склад Б</option><option>Склад Костюмов</option>
              </select>
            </div>
            <div className="fg">
              <label className="fl">Ячейка</label>
              <input className="fi" placeholder="A-01" value={f.cell} onChange={set("cell")} />
            </div>
          </div>
          <div className="frow">
            <div className="fg">
              <label className="fl">Происхождение</label>
              <select className="fi" value={f.origin} onChange={set("origin")}>
                {["Закупка", "Собственный склад", "Аренда", "Бутафорский цех", "Оценка"].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="fg">
              <label className="fl">Стоимость (руб)</label>
              <input className="fi" type="number" placeholder="0" value={f.val} onChange={set("val")} />
            </div>
          </div>
          <div className="fg">
            <label className="fl">Уникальные признаки</label>
            <input className="fi" placeholder="Скол на дне слева" value={f.unique} onChange={set("unique")} />
          </div>
          {err && <div className="banner-err" style={{ marginBottom: 10 }}>{err}</div>}
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn bp" style={{ flex: 1 }} onClick={save} disabled={loading}>
              <Icon n="chk" s={14} c="#fff" />{loading ? "Сохраняем..." : "Поставить на учёт"}
            </button>
            <button className="btn bg" onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div></Portal>
  );
}
