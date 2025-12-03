import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// COMPONENTES
import Login from "./components/Login";
import AlertCard from "./components/AlertCard";

// LAYOUT
import Navbar from "./layout/Navbar";

// PÁGINAS
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import { getStoredAuth, logout as apiLogout } from "./api";

function App() {
  const stored = getStoredAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(!!stored);

  const [showAlerts, setShowAlerts] = useState(false);
  const [rol, setRol] = useState(stored?.rol || "Cliente"); // Cliente / Admin / SuperAdmin
  const CLIENT_URL = process.env.REACT_APP_CLIENT_URL || "http://localhost:3001";

  const handleLogout = () => {
    apiLogout();
    setIsAuthenticated(false);
    setRol("Cliente");
    window.location.href = CLIENT_URL;
  };

  return (
    <Router>
      {/* NAVBAR PARA ADMIN Y SUPERADMIN */}
      {isAuthenticated && rol !== "Cliente" && (
        <Navbar onLogout={handleLogout} />
      )}

      {/* POPUP ALERTAS */}
      {showAlerts && <AlertCard onClose={() => setShowAlerts(false)} />}

      <Routes>

        {/* LOGIN */}
        {!isAuthenticated ? (
          <Route
            path="/"
            element={
              <Login
                onLogin={(role) => {
                  setRol(role);
                  setIsAuthenticated(true);
                }}
              />
            }
          />
        ) : (
          <>
            {/* Dashboard: Admin y SuperAdmin */}
            <Route
              path="/dashboard"
              element={
                rol !== "Cliente" ? <Dashboard /> : <Navigate to="/unauthorized" replace />
              }
            />

            {/* Inventario: Admin y SuperAdmin */}
            <Route
              path="/inventory"
              element={
                rol === "Admin" || rol === "SuperAdmin"
                  ? <Inventory />
                  : <Navigate to="/unauthorized" replace />
              }
            />

            {/* Usuarios: SOLO SuperAdmin */}
            <Route
              path="/users"
              element={
                rol === "SuperAdmin" ? <Users /> : <Navigate to="/unauthorized" replace />
              }
            />

            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/unauthorized" element={<div className="p-6">Acceso no autorizado.</div>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
