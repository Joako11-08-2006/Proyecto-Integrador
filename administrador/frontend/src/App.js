import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Inventario from "./components/Inventario";
import Comprobantes from "./components/Comprobantes";
import Usuarios from "./components/Usuarios";
import Login from "./components/Login";

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Login />} />               {/* 🔐 Página de login */}
                    <Route path="/dashboard" element={<Dashboard />} />  {/* 🏠 Dashboard */}
                    <Route path="/inventario" element={<Inventario />} />{/* 📦 Inventario */}
                    <Route path="/comprobantes" element={<Comprobantes />} />{/* 📜 Comprobantes */}
                    <Route path="/usuarios" element={<Usuarios />} />    {/* 👥 Gestión de usuarios */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;


