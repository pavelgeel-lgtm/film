import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import { apiFetch } from "../api";
import { ROLES_INIT } from "../constants";

const ROLE_LABELS = {
  admin: "Администратор",
  warehouse: "Сотрудник склада",
  kpp: "КПП / Режиссёрская группа",
  field: "Площадка",
};

export default function RolesView() {
  const [roles] = useState(ROLES_INIT);
  const [users, setUsers] = useState([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: "", email: "", pass: "", role: "warehouse" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  useEffect(() => {
    apiFetch("/auth/users").then(setUsers).catch(() => {});
  }, []);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const addUser = async () => {
    if (!f.name.trim() || !f.pass.trim()) { setErr("Укажите имя и пароль"); return; }
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const { user } = await apiFetch("/auth/register", {
        method: "POST",
        body: { name: f.name, email: f.email || undefined, password: f.pass, role: f.role },
      });
      setOk(`✓ Создан: ${f.name}`);
      setUsers(p => [...p, user]);
      setF({ name: "", email: "", pass: "", role: "warehouse" });
      setTimeout(() => { setAdding(false); setOk(null); }, 2500);
    } catch (e) {
      setErr(e?.error || e?.message || "Ошибка создания пользователя");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="rg" style={{ marginBottom: 16 }}>
        {roles.map(r => (
          <div key={r.name} className="rc">
            <div className="rico" style={{ background: r.bg }}><Icon n={r.ico} s={15} c={r.g} /></div>
            <span className="rname">{r.name}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="ch">
          <span className="ct">Пользователи системы</span>
          <span className="cs">{users.length} аккаунтов</span>
        </div>
        {users.length === 0 && (
          <div style={{ padding: "20px 18px", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Нет данных</div>
        )}
        {users.map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: "1px solid rgba(0,0,0,.05)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#00AEEF,#0055A5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 11 }}>{u.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
              {u.email && <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{u.email}</div>}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "#E6F7FD", color: "#00AEEF" }}>
              {ROLE_LABELS[u.role] || u.role}
            </span>
          </div>
        ))}
      </div>

      {!adding ? (
        <button className="btn bp" onClick={() => setAdding(true)}><Icon n="plus" s={14} c="#fff" />Создать аккаунт сотрудника</button>
      ) : (
        <div className="card" style={{ padding: "18px 20px", maxWidth: 480 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Новый сотрудник</div>
          <div className="fg">
            <label className="fl">Имя и фамилия *</label>
            <input className="fi" placeholder="Волков Дмитрий" value={f.name} onChange={set("name")} />
          </div>
          <div className="fg">
            <label className="fl">Email (необязательно)</label>
            <input className="fi" type="email" placeholder="d.volkov@3xmedia.ru" value={f.email} onChange={set("email")} />
          </div>
          <div className="fg">
            <label className="fl">Пароль *</label>
            <input className="fi" type="password" placeholder="Минимум 8 символов" value={f.pass} onChange={set("pass")} />
          </div>
          <div className="fg">
            <label className="fl">Роль в системе</label>
            <select className="fi" value={f.role} onChange={set("role")}>
              <option value="admin">Администратор</option>
              <option value="warehouse">Сотрудник склада</option>
              <option value="kpp">КПП / Режиссёрская группа</option>
              <option value="field">Площадка (реквизитор/костюмер)</option>
            </select>
          </div>
          {err && <div className="banner-err" style={{ marginBottom: 10 }}>{err}</div>}
          {ok  && <div className="banner-ok"  style={{ marginBottom: 10 }}>{ok}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn bp" onClick={addUser} disabled={loading}>
              <Icon n="chk" s={14} c="#fff" />{loading ? "Создаём..." : "Создать"}
            </button>
            <button className="btn bg" onClick={() => { setAdding(false); setErr(null); }}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}
