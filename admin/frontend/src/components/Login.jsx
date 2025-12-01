import React, { useState } from "react";
import { login as loginApi, obtenerPerfil, setStoredAuth } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokens = await loginApi(username, password);
      setStoredAuth({ access: tokens.access, refresh: tokens.refresh });
      const perfil = await obtenerPerfil(tokens.access);
      const rol = perfil.rol || "Cliente";
      if (rol !== "Admin" && rol !== "SuperAdmin") {
        setError("Acceso solo para Admin/SuperAdmin");
        return;
      }
      setStoredAuth({ rol });

      onLogin(rol);
    } catch (err) {
      setError("Credenciales inválidas o no autorizadas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
