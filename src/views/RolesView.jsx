import { useState } from "react";
import Icon from "../components/Icon";
import { apiFetch } from "../api";
import { ROLES_INIT } from "../constants";

export default function RolesView() {
  const [roles] = useState(ROLES_INIT);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: "", email: "", pass: "", role: "warehouse" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const addUser = async () => {
    if (!f.name.trim() || !f.email.trim() || !f.pass.trim()) { setErr("Заполните все поля"); return; }
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      await apiFetch("/auth/register", { method: "POST", body: { name: f.name, email: f.email, password: f.pass, role: f.role } });
      setOk(`Пользователь ${f.name} создан. Логин: ${f.email}`);
      setF({ name: "", email: "", pass: "", role: "warehouse" });
      setTimeout(() => { setAdding(false); setOk(null); }, 3000);
    } catch (e) {
      setErr(e?.error || "Ошибка");
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

      {!adding ? (
        <button className="btn bp" onClick={() => setAdding(true)}><Icon n="plus" s={14} c="#fff" />Создать аккаунт сотрудника</button>
      ) : (
        <div className="card" style={{ padding: "18px 20px", maxWidth: 480 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Новый сотрудник</div>
          <div className="fg">
            <label className="fl">Имя и фамилия</label>
            <input className="fi" placeholder="Волков Дмитрий" value={f.name} onChange={set("name")} />
          </div>
          <div className="fg">
            <label className="fl">Email (логин)</label>
            <input className="fi" type="email" placeholder="d.volkov@3xmedia.ru" value={f.email} onChange={set("email")} />
          </div>
          <div className="fg">
            <label className="fl">Пароль</label>
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
          {ok && <div className="banner-ok" style={{ marginBottom: 10 }}>✓ {ok}</div>}
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
