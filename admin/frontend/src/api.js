import axios from "axios";

export const API_ROOT = "http://127.0.0.1:8000";
export const API_URL = `${API_ROOT}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Helpers de sesión en localStorage
export function getStoredAuth() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const rol = localStorage.getItem("userRole");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, rol: rol || "Cliente" };
}

export function setStoredAuth({ access, refresh, rol }) {
  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
  if (rol) localStorage.setItem("userRole", rol);
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
}

// Interceptor JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intenta refrescar token en 401 y reintenta la petición
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = res.data.access;
        localStorage.setItem("accessToken", newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        queue.forEach((p) => p.resolve(newAccess));
        queue = [];
        return api(originalRequest);
      } catch (err) {
        queue.forEach((p) => p.reject(err));
        queue = [];
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function login(username, password) {
  const res = await axios.post(`${API_URL}/token/`, {
    username,
    password,
  });
  return res.data;
}

export async function obtenerPerfil(accessToken) {
  const res = await axios.get(`${API_ROOT}/api/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

// Obtener alertas (Django)
export async function obtenerAlertas() {
  const res = await api.get("/alertas/no-vistas/");
  return Array.isArray(res.data) ? res.data : [];
}

// Marcar alerta vista
export async function marcarAlertaVista(id) {
  return api.patch(`/alertas/${id}/visto/`);
}

// Estadísticas de ventas
export async function ventasStats() {
  const res = await api.get("/ventas/stats/");
  return res.data;
}

// Productos (para conteos/dashboard)
export async function productos() {
  const res = await api.get("/productos/");
  return res.data;
}

export default api;

