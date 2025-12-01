import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    ShoppingCartIcon,
    BellIcon,
    HomeIcon,
    ArrowsRightLeftIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    CheckIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { cart, notifications, loadNotifications, markAllNotificationsRead, deleteNotification } = useShop();
    const totalItems = cart?.items?.length || 0;
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [openNotif, setOpenNotif] = useState(false);

    useEffect(() => {
        loadNotifications().catch(() => {});
    }, [loadNotifications]);

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read && !n.leido).length, [notifications]);

    const baseLink = "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium";
    const active = "bg-blue-500 text-white shadow";
    const inactive = "text-gray-700 hover:bg-gray-100";

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const userLetter = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "C";
    const role = user?.rol || "Cliente";

    return (
        <>
            <header className="w-full bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                    <Link to="/home" className="flex items-center gap-2">
                        <div className="bg-blue-500 text-white rounded-2xl p-2 shadow">
                            <span className="text-xl">TM</span>
                        </div>
                        <div className="leading-tight">
                            <p className="font-bold text-blue-700">TecnoMarket</p>
                            <p className="text-xs text-gray-500">Tu tienda de celulares</p>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <NavLink to="/home" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                            <HomeIcon className="w-4 h-4" /> Inicio
                        </NavLink>

                        <NavLink to="/comparar" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                            <ArrowsRightLeftIcon className="w-4 h-4" /> Comparar
                        </NavLink>

                        <NavLink to="/carrito" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                            <div className="relative flex items-center gap-1">
                                <ShoppingCartIcon className="w-4 h-4" />
                                <span>Carrito</span>
                                {totalItems > 0 && (
                                    <span className="absolute -right-3 -top-2 bg-green-500 text-white text-xs rounded-full px-1.5">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </NavLink>

                        <NavLink to="/perfil" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                            <UserCircleIcon className="w-4 h-4" /> Perfil
                        </NavLink>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setOpenNotif(true); loadNotifications().catch(() => {}); }}
                            className="relative p-2 rounded-full hover:bg-gray-100"
                        >
                            <BellIcon className="w-5 h-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                            <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {userLetter}
                            </div>
                            <div className="ml-2 leading-tight">
                                <p className="text-xs font-semibold">{user?.nombre || "Cliente"}</p>
                                <p className="text-[10px] text-gray-500">{role}</p>
                            </div>
                        </div>

                        <button onClick={handleLogout} className="flex items-center gap-1 border px-3 py-1.5 rounded-full text-sm text-gray-700 hover:bg-gray-50">
                            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Salir
                        </button>
                    </div>
                </div>
            </header>

            {openNotif && (
                <div className="fixed inset-0 flex justify-end bg-black bg-opacity-20 backdrop-blur-sm z-50">
                    <div className="w-96 h-full bg-white shadow-xl p-5 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BellIcon className="w-6 h-6 text-blue-600" />
                                Notificaciones
                            </h2>
                            <button onClick={() => setOpenNotif(false)}>
                                <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-black" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">{unreadCount} sin leer</p>

                        <button
                            onClick={() => markAllNotificationsRead().catch(() => {})}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 text-sm mb-4"
                        >
                            <CheckIcon className="w-4 h-4" />
                            Marcar todas como leidas
                        </button>

                        {notifications.map((n) => (
                            <div key={n.id} className="border rounded-xl p-4 mb-3 flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.read || n.leido ? "bg-gray-100" : "bg-blue-50"}`}>
                                        <BellIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{n.title || n.titulo}</p>
                                        <p className="text-sm text-gray-500">{n.message || n.mensaje}</p>
                                    </div>
                                </div>

                                <button onClick={() => deleteNotification(n.id).then(() => loadNotifications())}>
                                    <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
