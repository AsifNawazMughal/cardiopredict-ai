const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken() { if (typeof window === "undefined") return null; return localStorage.getItem("token"); }
export function setToken(t) { localStorage.setItem("token", t); }
export function removeToken() { localStorage.removeItem("token"); localStorage.removeItem("user"); }
export function getUser() { if (typeof window === "undefined") return null; const u = localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
export function saveUser(u) { localStorage.setItem("user", JSON.stringify(u)); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) { const e = await res.json().catch(() => ({ detail: "Unknown error" })); throw new Error(e.detail || `HTTP ${res.status}`); }
  return res.json();
}

export const authApi = {
  async login(username, password) {
    const fd = new URLSearchParams();
    fd.append("username", username); fd.append("password", password);
    const res = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: fd });
    if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Login failed"); }
    const data = await res.json(); setToken(data.access_token); saveUser(data.user); return data;
  },
  async register(payload) { return apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload) }); },
  async checkAvailability({ username, email } = {}) {
    const params = new URLSearchParams();
    if (username) params.append("username", username);
    if (email) params.append("email", email);
    return apiFetch(`/auth/check-availability?${params}`);
  },
  logout() { removeToken(); },
};

export const profileApi = {
  async getMe() { return apiFetch("/auth/me"); },
  async update(data) { const user = await apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(data) }); saveUser(user); return user; },
};

export const patientsApi = {
  async getAll(search) { const q = search ? `?search=${encodeURIComponent(search)}` : ""; return apiFetch(`/patients/${q}`); },
  async getOne(id) { return apiFetch(`/patients/${id}`); },
  async create(data) { return apiFetch("/patients/", { method: "POST", body: JSON.stringify(data) }); },
  async update(id, data) { return apiFetch(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }); },
  async remove(id) { const token = getToken(); await fetch(`${API_URL}/patients/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); },
};

export const predictionsApi = {
  async predict(data) { return apiFetch("/predictions/predict", { method: "POST", body: JSON.stringify(data) }); },
  async getById(id) { return apiFetch(`/predictions/${id}`); },
  async getHistory(patientId) { const q = patientId ? `?patient_id=${patientId}` : ""; return apiFetch(`/predictions/history${q}`); },
  async getModelsPerformance() { return apiFetch("/predictions/models-performance"); },
};
