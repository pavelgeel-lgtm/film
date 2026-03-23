import { useState } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import Cell from "../components/Cell";
import ItemModal from "../modals/ItemModal";
import { ITEMS, NOTIFS } from "../constants";

export default function HomeView() {
  const [selItem, setSelItem] = useState(null);
  const onStock = ITEMS.filter(i => i.status === "На складе").length;
  const issued  = ITEMS.filter(i => i.status === "Выдан").length;
  const totalVal = ITEMS.reduce((s, i) => s + (i.val || 0), 0);

  const stats = [
    { ico: "box",  num: onStock,                     lbl: "На складе",       bg: "#dcfce7", ic: "#16a34a" },
    { ico: "ul",   num: issued,                      lbl: "Выдано",          bg: "#fef3c7", ic: "#d97706" },
    { ico: "bell", num: NOTIFS.length,               lbl: "Уведомлений",     bg: "#fee2e2", ic: "#dc2626" },
    { ico: "tag",  num: totalVal.toLocaleString() + " руб", lbl: "Стоимость склада", bg: "#E6F7FD", ic: "#00AEEF" },
  ];

  const projects = [
    { name: "НАШ СПЕЦНАЗ-4", type: "Сериал",     bl: 3, tot: 8 },
    { name: "ДЕТЕКТИВ-2",     type: "Сериал",     bl: 1, tot: 6 },
    { name: "ТИХАЯ ГАВАНЬ",   type: "Полный метр", bl: 0, tot: 4 },
  ];

  const notifCfg = { crit: { bg: "rgba(220,38,38,.09)", c: "#dc2626" }, warn: { bg: "rgba(217,119,6,.09)", c: "#d97706" }, info: { bg: "rgba(37,99,235,.08)", c: "#00AEEF" } };

  return (
    <div>
      <div className="sg">
        {stats.map(s => (
          <div key={s.lbl} className="sc">
            <div className="sib" style={{ background: s.bg }}><Icon n={s.ico} s={17} c={s.ic} /></div>
            <div className="sn" style={{ color: s.ic }}>{s.num}</div>
            <div className="sl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card">
          <div className="ch"><span className="ct">Активные проекты</span></div>
          {projects.map(p => (
            <div key={p.name} style={{ padding: "11px 16px", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1, fontWeight: 500 }}>{p.type} · Блок {p.bl} из {p.tot}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: p.bl > 0 ? "#dcfce7" : "rgba(0,0,0,.05)", color: p.bl > 0 ? "#16a34a" : "#94a3b8" }}>
                  {p.bl > 0 ? "В работе" : "Подготовка"}
                </span>
              </div>
              <div className="pg"><div className="pf" style={{ width: `${(p.bl / p.tot) * 100}%`, background: p.bl > 0 ? "#00AEEF" : "#94a3b8" }} /></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="ch"><span className="ct">Уведомления</span><span className="cs">{NOTIFS.length} активных</span></div>
          {NOTIFS.map(n => {
            const cfg = notifCfg[n.lv];
            return (
              <div key={n.id} className="nr">
                <div className="ni2" style={{ background: cfg.bg }}><Icon n={n.ico} s={16} c={cfg.c} /></div>
                <div style={{ flex: 1 }}>
                  <div className="ntt">{n.title}</div>
                  <div className="nb">{n.body}</div>
                  <div className="nm"><span>{n.who}</span><span>·</span><span>{n.project}</span></div>
                </div>
                <span className="ntm">{n.time} назад</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="ch"><span className="ct">Активные выдачи</span><span className="cs">нажмите строку — откроется карточка</span></div>
        <table className="tbl">
          <thead><tr><th>ID</th><th>Единица</th><th>Получатель</th><th>Склад · Ячейка</th><th>Вернуть до</th><th>Статус</th></tr></thead>
          <tbody>
            {ITEMS.filter(i => i.status === "Выдан").map(i => (
              <tr key={i.id} onClick={() => setSelItem(i)}>
                <td><span className="idc">{i.id}</span></td>
                <td style={{ fontWeight: 700 }}>{i.name}</td>
                <td style={{ color: "#334155", fontWeight: 500 }}>{i.issuedTo}</td>
                <td><Cell wh={i.wh} cell={i.cell} /></td>
                <td style={{ color: "#dc2626", fontWeight: 800, fontSize: 12.5 }}>{i.returnDate}</td>
                <td><Pill s={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selItem && <ItemModal item={selItem} onClose={() => setSelItem(null)} />}
    </div>
  );
}
