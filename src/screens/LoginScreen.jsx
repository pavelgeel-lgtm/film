import { useState } from "react";
import Icon from "../components/Icon";
import { ClapIcon } from "../components/Icon";
import { apiFetch } from "../api";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const doLogin = async (e) => {
    e.preventDefault();
    if (!email || !pass) return;
    setLoading(true);
    setErr(null);
    try {
      const d = await apiFetch("/auth/login", { method: "POST", body: { email, password: pass } }, false);
      localStorage.setItem("access_token", d.access);
      localStorage.setItem("refresh_token", d.refresh);
      onLogin(d.user);
    } catch (e) {
      setErr(e?.error || "Ошибка входа");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--surface)" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 380, boxShadow: "var(--sh2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div className="sb-mark"><ClapIcon s={20} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>3X Media Cloud</div>
            <div style={{ fontSize: 11.5, color: "var(--ink3)", fontWeight: 600 }}>Production Assets</div>
          </div>
        </div>
        <form onSubmit={doLogin}>
          <div className="fg" style={{ marginBottom: 12 }}>
            <label className="fl">Email</label>
            <input className="fi" type="email" placeholder="user@example.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="fg" style={{ marginBottom: 20 }}>
            <label className="fl">Пароль</label>
            <input className="fi" type="password" placeholder="••••••••" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          {err && <div className="banner-err" style={{ marginBottom: 14 }}>{err}</div>}
          <button type="submit" className="btn bp" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
