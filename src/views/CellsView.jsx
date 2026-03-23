import { useState } from "react";
import Icon from "../components/Icon";
import { CELLS_DATA } from "../constants";

export default function CellsView() {
  const [selCell, setSelCell] = useState(null);
  const [search, setSearch] = useState("");
  const sections = ["A", "B", "C", "D", "K"];

  const stats = {
    free: CELLS_DATA.filter(c => c.status === "free").length,
    occ:  CELLS_DATA.filter(c => c.status === "occupied").length,
    blk:  CELLS_DATA.filter(c => c.status === "blocked").length,
  };

  const cellColor = c => {
    if (search && (c.itemName?.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())))
      return { bg: "#fef3c7", border: "#d97706", txt: "#92400e" };
    if (c.status === "free")     return { bg: "#dcfce7", border: "#16a34a", txt: "#065f46" };
    if (c.status === "occupied") return { bg: "#E6F7FD", border: "#00AEEF", txt: "#0090C8" };
    return { bg: "#f1f5f9", border: "#94a3b8", txt: "#64748b" };
  };

  return (
    <div>
      <div className="cells-bar">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ c: "#16a34a", bg: "#dcfce7", n: stats.free, l: "Свободно" }, { c: "#00AEEF", bg: "#E6F7FD", n: stats.occ, l: "Занято" }, { c: "#94a3b8", bg: "#f1f5f9", n: stats.blk, l: "Заблокировано" }].map(s => (
            <div key={s.l} style={{ background: s.bg, borderRadius: 10, padding: "8px 14px", border: `1px solid ${s.c}44` }}>
              <span style={{ fontWeight: 800, fontSize: 20, color: s.c }}>{s.n}</span>
              <span style={{ fontSize: 11.5, color: s.c, fontWeight: 600, marginLeft: 6 }}>{s.l}</span>
            </div>
          ))}
        </div>
        <div className="sw">
          <span className="sico"><Icon n="search" s={14} /></span>
          <input className="si" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по ячейке или предмету..." />
        </div>
      </div>

      {sections.map(sec => {
        const cells = CELLS_DATA.filter(c => c.section === sec);
        return (
          <div key={sec} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,.08)", padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: 10 }}>
              СЕКЦИЯ {sec} {sec === "K" ? "— Склад Костюмов" : "— Склад А/Б"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cells.map(c => {
                const col = cellColor(c);
                return (
                  <div
                    key={c.code}
                    onClick={() => setSelCell(c === selCell ? null : c)}
                    style={{ width: 80, height: 64, borderRadius: 8, border: `2px solid ${col.border}`, background: col.bg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "transform .1s", transform: selCell?.code === c.code ? "scale(1.08)" : "scale(1)" }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 800, color: col.txt }}>{c.code}</span>
                    {c.status === "occupied" && <span style={{ fontSize: 9, color: col.txt, fontWeight: 600, textAlign: "center", lineHeight: 1.2, padding: "0 4px" }}>{c.itemName?.split(" ").slice(0, 2).join(" ")}</span>}
                    {c.status === "free"     && <span style={{ fontSize: 9, color: col.txt, fontWeight: 600 }}>свободна</span>}
                    {c.status === "blocked"  && <span style={{ fontSize: 9, color: col.txt, fontWeight: 600 }}>заблок.</span>}
                  </div>
                );
              })}
            </div>
            {selCell && selCell.section === sec && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid rgba(0,0,0,.07)" }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Ячейка {selCell.code}</div>
                {selCell.status === "occupied" ? (
                  <>
                    <div style={{ fontSize: 13, color: "#334155" }}>{selCell.itemName}</div>
                    <div style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace", color: "#94a3b8", marginTop: 2 }}>{selCell.item}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button className="btn bp sm">Открыть карточку</button>
                      <button className="btn br sm">Освободить ячейку</button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>Ячейка свободна</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
