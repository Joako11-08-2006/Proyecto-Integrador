import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// COMPONENTES
import Login from "./components/Login";
import AlertList from "./components/AlertList";

// LAYOUT
import Navbar from "./layout/Navbar";

// PÁGINAS
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import Comprobantes from "./pages/Comprobantes";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [showAlerts, setShowAlerts] = useState(false);

  const rol = localStorage.getItem("userRole"); // Cliente / Admin / SuperAdmin

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {/* NAVBAR PARA ADMIN Y SUPERADMIN */}
      {isAuthenticated && rol !== "Cliente" && (
        <Navbar onLogout={handleLogout} />
      )}

      {/* POPUP ALERTAS */}
      {showAlerts && <AlertList onClose={() => setShowAlerts(false)} />}

      <Routes>

        {/* LOGIN */}
        {!isAuthenticated ? (
          <Route
            path="/"
            element={<Login onLogin={() => setIsAuthenticated(true)} />}
          />
        ) : (
          <>
            {/* Dashboard: Admin y SuperAdmin */}
            <Route
              path="/dashboard"
              element={
                rol !== "Cliente" ? <Dashboard /> : <Navigate to="/" />
              }
            />

            {/* Inventario: Admin y SuperAdmin */}
            <Route
              path="/inventory"
              element={
                rol === "Admin" || rol === "SuperAdmin"
                  ? <Inventory />
                  : <Navigate to="/" />
              }
            />

            {/* Comprobantes: Admin y SuperAdmin */}
            <Route
              path="/comprobantes"
              element={
                rol === "Admin" || rol === "SuperAdmin"
                  ? <Comprobantes />
                  : <Navigate to="/" />
              }
            />

            {/* Usuarios: SOLO SuperAdmin */}
            <Route
              path="/users"
              element={
                rol === "SuperAdmin" ? <Users /> : <Navigate to="/" />
              }
            />

            {/* Redirecciones */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
