export const API = import.meta.env.VITE_API_URL || "/api";

let _refreshing = null;

export async function apiFetch(path, opts = {}, _retry = true) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && _retry) {
    const rt = localStorage.getItem("refresh_token");
    if (rt) {
      if (!_refreshing) {
        _refreshing = fetch(API + "/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: rt }),
        })
          .then(r => (r.ok ? r.json() : Promise.reject()))
          .then(d => {
            localStorage.setItem("access_token", d.access);
            localStorage.setItem("refresh_token", d.refresh);
          })
          .catch(() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.dispatchEvent(new Event("auth:logout"));
          })
          .finally(() => { _refreshing = null; });
      }
      await _refreshing;
      return apiFetch(path, opts, false);
    }
    window.dispatchEvent(new Event("auth:logout"));
    throw { error: "Не авторизован" };
  }

  if (!res.ok) throw await res.json();
  return res.json();
}
