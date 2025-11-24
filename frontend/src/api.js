import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Obtener alertas
export async function obtenerAlertas() {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_URL}/alertas/no-vistas/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
}

// Marcar alerta vista
export async function marcarAlertaVista(id) {
  const token = localStorage.getItem("accessToken");

  return fetch(`${API_URL}/alertas/${id}/visto/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default api;
