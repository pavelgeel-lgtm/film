import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";

// ── Регистрация Service Worker ───────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ── Подписка на Push (вызывается после логина) ───────────────────────────
export async function subscribePush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const res = await fetch("/api/push/vapid-public", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    const { key } = await res.json();
    if (!key) return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ subscription: sub }),
    });
  } catch {}
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
