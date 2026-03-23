import { useState, useRef } from "react";
import Icon from "../components/Icon";
import Pill from "../components/Pill";
import ItemModal from "../modals/ItemModal";
import SceneEditModal from "../modals/SceneEditModal";
import { dc } from "../constants";
import { KPP_INIT, ITEMS } from "../constants";
import { API } from "../api";

export default function KPPView() {
  const [scenes, setScenes] = useState(KPP_INIT);
  const [open, setOpen] = useState({ "46-1": true });
  const [stab, setStab] = useState({});
  const [editScene, setEditScene] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const kppInputRef = useRef(null);
  const scriptInputRef = useRef(null);

  const tog = id => setOpen(p => ({ ...p, [id]: !p[id] }));
  const gtab = id => stab[id] || "items";
  const settab = (id, t) => setStab(p => ({ ...p, [id]: t }));
  const saveScene = updated => setScenes(p => p.map(s => s.id === updated.id ? updated : s));
  const findItem = ref => ITEMS.find(i => i.id === ref);

  const all = scenes.flatMap(s => s.items);
  const cn = {
    ok:  all.filter(i => ["На складе", "Постоянный"].includes(i.status)).length,
    par: all.filter(i => ["Частично", "Сделать"].includes(i.status)).length,
    no:  all.filter(i => ["Нет", "Изготовить"].includes(i.status)).length,
    sup: all.filter(i => i.status === "Поставщик").length,
  };

  const uploadFile = async (file, doc_type) => {
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", doc_type);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API}/kpp/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setUploadMsg({ ok: true, text: `Файл "${data.filename}" загружен` });
    } catch (e) {
      setUploadMsg({ ok: false, text: e?.error || "Ошибка загрузки" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {uploadMsg && (
        <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 8, background: uploadMsg.ok ? "#dcfce7" : "#fee2e2", color: uploadMsg.ok ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
          {uploadMsg.text}
          <button onClick={() => setUploadMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}><Icon n="x" s={14} /></button>
        </div>
      )}
      <input ref={kppInputRef} type="file" style={{ display: "none" }} accept=".pdf,.xlsx,.xls,.png,.jpg" onChange={e => { uploadFile(e.target.files[0], "kpp"); e.target.value = ""; }} />
      <input ref={scriptInputRef} type="file" style={{ display: "none" }} accept=".pdf,.txt" onChange={e => { uploadFile(e.target.files[0], "script"); e.target.value = ""; }} />

      <div className="kbar">
        <div className="kbar-top">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>СЪЁМОЧНЫЙ ДЕНЬ</div>
            <div className="kdate">08-09.02.2025</div>
          </div>
          <div className="kdiv" />
          <div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>Проект</div>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>НАШ СПЕЦНАЗ-4 · Блок 3</div>
          </div>
        </div>
        <div className="kbar-counts">
          {[["#16a34a", cn.ok, "На складе"], ["#d97706", cn.par, "Частично"], ["#dc2626", cn.no, "Нет"], ["#00AEEF", cn.sup, "Поставщик"]].map(([c, n, l]) => (
            <div key={l} className="kcnt">
              <div className="kcn" style={{ color: c }}>{n}</div>
              <div className="kcl">{l}</div>
            </div>
          ))}
        </div>
        <div className="kbar-actions">
          <button className="btn bg sm" disabled={uploading} onClick={() => kppInputRef.current?.click()}>
            <Icon n="dl" s={13} />{uploading ? "Загрузка..." : "Загрузить КПП"}
          </button>
          <button className="btn bg sm" disabled={uploading} onClick={() => scriptInputRef.current?.click()}>
            <Icon n="doc" s={13} />Загрузить сценарий
          </button>
          <button className="btn bp sm"><Icon n="send" s={13} c="#fff" />Экспорт</button>
        </div>
      </div>

      {scenes.map(s => (
        <div key={s.id} className="scene">
          <div className="sh2">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }} onClick={() => tog(s.id)}>
              <div className="snum">{s.id}</div>
              <span className="stag2" style={{ background: s.type === "НАТ" ? "#dcfce7" : "#E6F7FD", color: s.type === "НАТ" ? "#16a34a" : "#00AEEF" }}>{s.type}</span>
              <div style={{ flex: 1 }}>
                <div className="sloc">{s.loc}</div>
                <div className="stm">{s.date} · {s.time} · {s.desc}</div>
              </div>
            </div>
            <span className="sdur"><Icon n="clk" s={12} c="#334155" />{s.dur}</span>
            {s.items.some(i => ["Нет", "Изготовить"].includes(i.status)) && <span style={{ marginRight: 4 }}><Pill s="Нет" /></span>}
            {s.items.some(i => ["Частично", "Сделать"].includes(i.status)) && <span style={{ marginRight: 4 }}><Pill s="Частично" /></span>}
            <button className="btn bg sm" style={{ padding: "4px 9px", marginRight: 6 }} onClick={e => { e.stopPropagation(); setEditScene(s); }}>
              <Icon n="edit" s={13} />Изменить
            </button>
            <div style={{ cursor: "pointer" }} onClick={() => tog(s.id)}>
              <Icon n={open[s.id] ? "cd" : "cr"} s={17} c="#94a3b8" />
            </div>
          </div>

          {open[s.id] && (
            <div className="sbody">
              <div className="stabs">
                <button className={`stab ${gtab(s.id) === "items" ? "on" : ""}`} onClick={() => settab(s.id, "items")}>Реквизит и костюмы</button>
                <button className={`stab ${gtab(s.id) === "makeup" ? "on" : ""}`} onClick={() => settab(s.id, "makeup")}>Грим</button>
              </div>
              {gtab(s.id) === "items" && (
                <div className="sp">
                  <div className="sptitle"><Icon n="box" s={12} c="#94a3b8" />Реквизит и костюмы · нажмите название для карточки</div>
                  {s.items.map((it, i) => {
                    const linked = it.ref ? findItem(it.ref) : null;
                    return (
                      <div key={i} className="ir">
                        <span className="dtag" style={{ background: dc(it.dept).bg, color: dc(it.dept).tx }}>{it.dept}</span>
                        <div style={{ flex: 1 }}>
                          <div className={linked ? "in" : ""} style={!linked ? { fontSize: "12.5px", fontWeight: 600 } : {}} onClick={() => linked && setSelItem(linked)}>
                            {it.name}
                          </div>
                          {it.note && <div className="inote">{it.note}</div>}
                          {it.ref && <span className="idc" style={{ fontSize: 10, marginTop: 2, display: "inline-block" }}>{it.ref}</span>}
                        </div>
                        <Pill s={it.status} />
                      </div>
                    );
                  })}
                  <div className="kpp-btns">
                    <button className="btn bp sm"><Icon n="chk" s={13} c="#fff" />Создать запросы</button>
                    <button className="btn bg sm"><Icon n="send" s={13} />Запрос поставщику</button>
                    <button className="btn bg sm"><Icon n="dl" s={13} />Список закупки</button>
                  </div>
                </div>
              )}
              {gtab(s.id) === "makeup" && (
                <div className="sp">
                  <div className="sptitle"><Icon n="face" s={12} c="#94a3b8" />Грим по сцене</div>
                  {s.makeup.map((m, i) => (
                    <div key={i} className="mkrow">
                      <div style={{ minWidth: 110, flexShrink: 0 }}>
                        <div className="mkchar">{m.char}</div>
                        <div className="mkactor">{m.actor}</div>
                      </div>
                      <div className="mklook">{m.look}</div>
                      {m.cont !== "-" && <span className="mkcont">{m.cont}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {editScene && <SceneEditModal scene={editScene} onSave={saveScene} onClose={() => setEditScene(null)} />}
      {selItem && <ItemModal item={selItem} onClose={() => setSelItem(null)} />}
    </div>
  );
}
