import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminStats() {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user && (user.rol === "Admin" || user.rol === "SuperAdmin")) {
            api.topProducts()
                .then(setStats)
                .catch((err) => setMessage(err.message || "No se pudieron cargar las estadísticas"));
        }
    }, [user]);

    if (!user) return <Navigate to="/" replace />;
    if (user.rol !== "Admin" && user.rol !== "SuperAdmin") return <div className="p-6 text-center text-red-600 font-semibold">Acceso solo admin</div>;

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 mt-10">
                <h1 className="text-2xl font-bold mb-4">Estadísticas de Ventas</h1>
                {message && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{message}</p>}
                <div className="bg-white rounded-xl shadow p-4">
                    {stats.length === 0 && <p className="text-sm text-gray-500">Aún no hay datos.</p>}
                    {stats.length > 0 && (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Producto</th>
                                    <th className="p-2 text-left">Unidades</th>
                                    <th className="p-2 text-left">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map((s) => (
                                    <tr key={s.productName} className="border-b">
                                        <td className="p-2">{s.productName}</td>
                                        <td className="p-2">{s.quantity}</td>
                                        <td className="p-2">S/ {s.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
