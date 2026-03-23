import { useState } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import Cell from "../components/Cell";
import Portal from "../components/Portal";

const HIST = [
  { d: "14.02.2025", t: "Выдан", a: true },
  { d: "01.02.2025", t: "Возврат — состояние Хорошее", a: false },
  { d: "15.01.2025", t: "Выдан — Козлова Е.В. · ДЕТЕКТИВ-2", a: false },
  { d: "10.01.2025", t: "Постановка на учёт · 3 фото", a: false },
];

export default function ItemModal({ item, onClose }) {
  const [tab, setTab] = useState(0);
  const hist = [
    { d: "14.02.2025", t: `Выдан — ${item.issuedTo || "н/д"} · ${item.project || "—"}`, a: true },
    ...HIST.slice(1),
  ];

  return (
    <Portal><div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mtop">
          <div>
            <div className="mtitle">{item.name}</div>
            <div className="mid">{item.id}</div>
          </div>
          <button className="xbtn" onClick={onClose}><Icon n="x" s={15} /></button>
        </div>
        <div className="mtabs">
          {["Карточка", "Фотографии", "История"].map((t, i) => (
            <span key={t} className={`mtab ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>{t}</span>
          ))}
        </div>
        <div className="mbody">
          {tab === 0 && <>
            <div className="mgrid">
              {[
                ["Статус", <Pill s={item.status} />],
                ["Состояние", item.cond],
                ["Категория", item.cat],
                ["Стоимость", `${item.val?.toLocaleString()} руб`],
                ["Происхождение", item.origin],
                ["Фотографии", `${item.photos} фото`],
              ].map(([l, v]) => (
                <div key={l}><div className="mfl">{l}</div><div className="mfv">{v}</div></div>
              ))}
            </div>
            {item.wh && (
              <div className="ibox" style={{ background: "rgba(124,58,237,.06)", borderColor: "#7c3aed" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#7c3aed", marginBottom: 4 }}>МЕСТОНАХОЖДЕНИЕ</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Cell wh={item.wh} cell={item.cell} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>{item.wh}, ячейка {item.cell}</span>
                </div>
              </div>
            )}
            {item.unique && (
              <div className="ibox" style={{ background: "rgba(37,99,235,.06)", borderColor: "#00AEEF" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#00AEEF", marginBottom: 3 }}>УНИКАЛЬНЫЕ ПРИЗНАКИ</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.unique}</div>
              </div>
            )}
            {item.tags && (
              <div style={{ marginBottom: 12 }}>
                <div className="mfl">ТЕГИ</div>
                <div style={{ marginTop: 3 }}>{item.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            )}
            {item.issuedTo && (
              <div className="ibox" style={{ background: "rgba(217,119,6,.07)", borderColor: "#d97706", marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px", color: "#d97706", marginBottom: 5 }}>ТЕКУЩАЯ ВЫДАЧА</div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.9 }}>
                  Получатель: {item.issuedTo}<br />
                  Проект: {item.project} · {item.block}<br />
                  <span style={{ color: "#dc2626" }}>Вернуть до: {item.returnDate}</span>
                </div>
              </div>
            )}
            <div className="mact">
              <button className="btn bp sm"><Icon n="ul" s={13} c="#fff" />Выдать</button>
              <button className="btn bg sm"><Icon n="dl" s={13} />Вернуть</button>
              <button className="btn bg sm"><Icon n="edit" s={13} />Ред.</button>
              <button className="btn bg sm" style={{ marginLeft: "auto" }}><Icon n="doc" s={13} />PDF</button>
            </div>
          </>}
          {tab === 1 && (
            <div className="pgrid">
              {Array.from({ length: item.photos }).map((_, i) => (
                <div key={i} className="pph">
                  <Icon n="cam" s={20} c="#d1d5db" />
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "#94a3b8" }}>Фото {i + 1}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 2 && hist.map((h, i) => (
            <div key={i} className="hrow">
              <div className="hdot" style={{ background: h.a ? "#00AEEF" : "#d1d5db" }} />
              <div>
                <div className="hdate">{h.d}</div>
                <div className="htxt">{h.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div></Portal>
  );
}
