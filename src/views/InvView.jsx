import { useState } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import Cell from "../components/Cell";
import ItemModal from "../modals/ItemModal";
import AddModal from "../modals/AddModal";
import { ITEMS } from "../constants";

export default function InvView({ type }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);

  const items = ITEMS.filter(i =>
    (type === "c" ? i.id.startsWith("COS") : !i.id.startsWith("COS")) &&
    (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()))
  );

  const exportCSV = () => {
    const hdr = "ID,Название,Категория,Склад,Ячейка,Статус,Состояние,Стоимость";
    const rows = items.map(i =>
      [i.id, i.name, i.cat || "", i.wh || "", i.cell || "", i.status || "", i.cond || "", i.val || 0]
        .map(v => `"${v}"`).join(",")
    );
    const csv = [hdr, ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `${type === "c" ? "костюмы" : "реквизит"}_${new Date().toLocaleDateString("ru")}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="inv-bar">
        <div className="sw">
          <span className="sico"><Icon n="search" s={14} /></span>
          <input className="si" value={q} onChange={e => setQ(e.target.value)} placeholder={type === "c" ? "Поиск по костюмам..." : "Поиск по реквизиту..."} />
        </div>
        <button className="btn bg sm"><Icon n="sliders" s={13} />Фильтры</button>
        <button className="btn bg sm" onClick={exportCSV}><Icon n="dl" s={13} />Экспорт</button>
        <button className="btn bp sm" onClick={() => setAdd(true)}><Icon n="plus" s={13} c="#fff" />Поставить на учёт</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>ID</th><th>Название</th><th>Склад · Ячейка</th><th>Статус</th><th>Состояние</th><th>Стоимость</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} onClick={() => setSel(i)}>
                <td><span className="idc">{i.id}</span></td>
                <td>
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  {i.issuedTo && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, fontWeight: 500 }}>→ {i.issuedTo} · {i.project}</div>}
                </td>
                <td><Cell wh={i.wh} cell={i.cell} /></td>
                <td><Pill s={i.status} /></td>
                <td style={{ color: "#334155", fontSize: 12.5, fontWeight: 500 }}>{i.cond}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "#00AEEF", fontWeight: 500 }}>{i.val?.toLocaleString()} руб</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && <ItemModal item={sel} onClose={() => setSel(null)} />}
      {add && <AddModal onClose={() => setAdd(false)} />}
    </div>
  );
}
