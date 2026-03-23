import { useState, useRef } from "react";
import { API } from "../api";
import { apiFetch } from "../api";
import Icon from "./Icon";

export default function PhotoUploader({ refType, refId, initialPhotos = [] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const token = localStorage.getItem("access_token");
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("photo", file);
        fd.append("ref_type", refType);
        fd.append("ref_id", String(refId));
        const res = await fetch(`${API}/photos/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const data = await res.json();
        if (res.ok) setPhotos(p => [data, ...p]);
      } catch { /* continue */ }
    }
    setUploading(false);
  };

  const remove = async (photo) => {
    try {
      await apiFetch(`/photos/${photo.id}`, { method: "DELETE" });
      setPhotos(p => p.filter(x => x.id !== photo.id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple capture="environment"
        style={{ display: "none" }}
        onChange={e => { upload(e.target.files); e.target.value = ""; }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {photos.map(p => (
          <div key={p.id} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", background: "#f1f5f9" }}>
            <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button onClick={() => remove(p)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="x" s={12} c="#fff" />
            </button>
          </div>
        ))}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          style={{ aspectRatio: "4/3", borderRadius: 8, border: "2px dashed rgba(37,99,235,.3)", background: "#E6F7FD", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: uploading ? "wait" : "pointer", color: "#00AEEF" }}
        >
          <Icon n={uploading ? "clk" : "cam"} s={22} c="#00AEEF" />
          <span style={{ fontSize: 11, fontWeight: 700 }}>{uploading ? "Загрузка..." : "Добавить фото"}</span>
        </div>
      </div>
    </div>
  );
}
