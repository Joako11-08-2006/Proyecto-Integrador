import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // 🔥 AÑADE ESTO

const api = axios.create({
  baseURL: API_URL, 
});

// Agregamos el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtener alertas
export async function obtenerAlertas() {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_URL}/alertas/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
}

// Marcar alerta como vista
export async function marcarAlertaVista(id) {
  const token = localStorage.getItem("accessToken");

  return fetch(`${API_URL}/alertas/${id}/visto/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default api;
