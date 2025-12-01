import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [message, setMessage] = useState("");

    const load = async () => {
        try {
            const data = await api.ordersAll();
            setOrders(data || []);
        } catch (err) {
            setMessage(err.message || "No se pudieron cargar las órdenes");
        }
    };

    useEffect(() => {
        if (user && (user.rol === "Admin" || user.rol === "SuperAdmin")) {
            load().catch(() => {});
        }
    }, [user]);

    const updatePayment = async (id, status) => {
        try {
            await api.updateOrderStatus(id, { paymentStatus: status });
            setMessage("Pago actualizado a " + status);
            await load();
        } catch (err) {
            setMessage(err.message || "No se pudo actualizar");
        }
    };

    if (!user) return <Navigate to="/" replace />;
    if (user.rol !== "Admin" && user.rol !== "SuperAdmin") {
        return <div className="p-6 text-center text-red-600 font-semibold">Acceso solo para Admin/SuperAdmin</div>;
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 mt-10">
                <h1 className="text-2xl font-bold mb-4">Órdenes (Admin)</h1>
                {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{message}</p>}
                <div className="overflow-x-auto bg-white rounded-xl shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Usuario</th>
                                <th className="p-2 text-left">Pago</th>
                                <th className="p-2 text-left">Método</th>
                                <th className="p-2 text-left">Total</th>
                                <th className="p-2 text-left">Voucher</th>
                                <th className="p-2 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} className="border-b">
                                    <td className="p-2">#{o.id}</td>
                                    <td className="p-2">{o.userId || "-"}</td>
                                    <td className="p-2">{o.paymentStatus}</td>
                                    <td className="p-2">{o.paymentMethod}</td>
                                    <td className="p-2">S/ {o.total}</td>
                                    <td className="p-2 text-xs">
                                        {o.voucherUrl ? (
                                            <a className="text-blue-600 underline" href={o.voucherUrl} target="_blank" rel="noreferrer">Ver voucher</a>
                                        ) : "-"}
                                        {o.operationCode && <div>Código: {o.operationCode}</div>}
                                    </td>
                                    <td className="p-2 flex gap-2">
                                        <button className="px-3 py-1 text-xs bg-green-600 text-white rounded" onClick={() => updatePayment(o.id, "PAID")}>Aprobar</button>
                                        <button className="px-3 py-1 text-xs bg-red-600 text-white rounded" onClick={() => updatePayment(o.id, "REJECTED")}>Rechazar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
