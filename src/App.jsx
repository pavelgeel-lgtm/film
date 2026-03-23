import { useState, useEffect } from "react";
import Icon from "./components/Icon";
import { ClapIcon } from "./components/Icon";
import LoginScreen from "./screens/LoginScreen";
import HomeView from "./views/HomeView";
import NotifsView from "./views/NotifsView";
import WarehouseView from "./views/WarehouseView";
import InvView from "./views/InvView";
import CellsView from "./views/CellsView";
import KPPView from "./views/KPPView";
import FieldView from "./views/FieldView";
import RentalView from "./views/RentalView";
import { TransportView, LocationsView, PartnerView } from "./views/AssetViews";
import RolesView from "./views/RolesView";
import { apiFetch } from "./api";
import { NAV, BOT_NAV, TTLS } from "./constants";

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState("home");
  const [mOpen, setMOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setAuthChecked(true); return; }
    apiFetch("/auth/me", {}, false)
      .then(u => { setUser(u); setAuthChecked(true); })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const logout = () => {
    const rt = localStorage.getItem("refresh_token");
    if (rt) apiFetch("/auth/logout", { method: "POST", body: { token: rt } }, false).catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  if (!authChecked) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--surface)" }}>
      <div style={{ color: "var(--ink3)", fontWeight: 600, fontSize: 14 }}>Загрузка...</div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={setUser} />;

  const nav = v => { setView(v); setMOpen(false); };
  const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "??";

  return (
    <>
      {mOpen && <div className="sb-overlay" onClick={() => setMOpen(false)} />}
      <div className="app">
        {/* Sidebar */}
        <div className={`sb ${mOpen ? "open" : ""}`}>
          <div className="sb-top">
            <div className="sb-mark"><ClapIcon s={20} /></div>
            <div>
              <div className="sb-name">3X Media cloud</div>
              <div className="sb-sub">Production Assets</div>
            </div>
            <button className="xbtn" style={{ marginLeft: "auto", flexShrink: 0 }} onClick={() => setMOpen(false)}>
              <Icon n="x" s={14} />
            </button>
          </div>

          <nav className="nav">
            {NAV.map((item, i) =>
              item.s ? (
                <div key={i} className="ns" style={{ marginTop: i > 0 ? 4 : 0 }}>{item.s}</div>
              ) : (
                <div key={item.id} className={`ni ${view === item.id ? "on" : ""}`} onClick={() => nav(item.id)}>
                  <span className="nico"><Icon n={item.ico} s={15} c={view === item.id ? "#00AEEF" : "#334155"} /></span>
                  {item.lbl}
                  {item.badge > 0 && <span className="bdg">{item.badge}</span>}
                </div>
              )
            )}
          </nav>

          <div className="sb-bot" onClick={logout}>
            <div className="ava">{initials}</div>
            <div>
              <div className="avn">{user.name}</div>
              <div className="avr">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <button className="hamburger" onClick={() => setMOpen(true)}><Icon n="layers" s={18} /></button>
            <div className="tbt">{TTLS[view]}</div>
            {view === "kpp" && <span className="tbp">08-09.02.2025 · Блок 3</span>}
            <div style={{ flex: 1 }} />
            <div className="sep" />
            <button className="btn bg sm" onClick={logout} style={{ fontSize: 11 }}>
              <Icon n="x" s={12} />Выйти
            </button>
          </div>

          <div className="content">
            {view === "home"      && <HomeView />}
            {view === "notifs"    && <NotifsView />}
            {view === "warehouse" && <WarehouseView user={user} />}
            {view === "props"     && <InvView type="p" />}
            {view === "costumes"  && <InvView type="c" />}
            {view === "cells"     && <CellsView />}
            {view === "kpp"       && <KPPView />}
            {view === "field"     && <FieldView user={user} />}
            {view === "rental"    && <RentalView />}
            {view === "transport" && <TransportView />}
            {view === "locations" && <LocationsView />}
            {view === "pprops"    && <PartnerView />}
            {view === "roles"     && <RolesView />}
          </div>

          {/* Bottom nav (mobile) */}
          <div className="bnav">
            {BOT_NAV.map(b => (
              <button key={b.id} className={`bni${view === b.id ? " on" : ""}`} onClick={() => nav(b.id)}>
                <div className="bni-ico"><Icon n={b.ico} s={22} c={view === b.id ? "#00AEEF" : "#8898AA"} /></div>
                {b.lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
