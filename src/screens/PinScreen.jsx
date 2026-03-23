import { useState } from "react";
import Icon from "../components/Icon";
import { API } from "../api";

export default function PinScreen({ userId, userName, onSuccess }) {
  const [digits, setDigits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const press = async (d) => {
    if (loading) return;
    const next = [...digits, d];
    setDigits(next);
    setError(null);
    if (next.length === 4) {
      setLoading(true);
      try {
        const res = await fetch(`${API}/auth/pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, pin: next.join("") }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        onSuccess(data.user);
      } catch {
        setError("Неверный PIN");
        setDigits([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const del = () => { setDigits(p => p.slice(0, -1)); setError(null); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1e3a8a,#7c3aed)" }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: 300, textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#00AEEF,#0090C8)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n="user" s={28} c="#fff" />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{userName || "Войти"}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>Введите PIN-код</div>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 32 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < digits.length ? "#00AEEF" : "#e2e8f0", transition: "background .15s" }} />
          ))}
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
            <button
              key={i}
              onClick={() => k === "⌫" ? del() : k !== "" ? press(String(k)) : null}
              disabled={loading || k === ""}
              style={{ height: 56, borderRadius: 12, border: "1.5px solid #e2e8f0", background: k === "" ? "transparent" : "#f8fafc", fontSize: k === "⌫" ? 20 : 22, fontWeight: 700, color: "#1e293b", cursor: k === "" ? "default" : "pointer", transition: "background .1s", fontFamily: "inherit" }}
            >
              {loading && digits.length === 4 && k !== "⌫" ? "" : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
