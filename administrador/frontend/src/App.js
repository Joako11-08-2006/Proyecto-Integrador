import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Inventario from "./components/Inventario";
import Comprobantes from "./components/Comprobantes";

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/comprobantes" element={<Comprobantes />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

