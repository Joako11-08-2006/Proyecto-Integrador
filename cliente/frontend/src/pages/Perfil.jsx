import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    ShieldCheckIcon,
    BellAlertIcon,
    InboxStackIcon,
    TrashIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { api } from "../api";

export default function Perfil() {
    const { user, refreshProfile, updateProfile, changePassword, login } = useAuth();
    const { notifications, loadNotifications, orders, loadOrders } = useShop();
    const [receipt, setReceipt] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [data, setData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
    });
    const [fotoPreview, setFotoPreview] = useState(null);
    const [password, setPassword] = useState({ actual: "", nueva: "", confirmar: "" });
    const [message, setMessage] = useState(null);
    const [addrs, setAddrs] = useState([]);
    const [addrForm, setAddrForm] = useState({
        etiqueta: "",
        nombre: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        estado: "",
        pais: "",
        zipCode: "",
        principal: false,
    });
    const [prefs, setPrefs] = useState({ promociones: true, emailAlerts: true, orderUpdates: true });

    useEffect(() => {
        refreshProfile()
            .then((profile) => {
                if (profile) {
                    setData({
                        nombre: profile.nombre || "",
                        email: profile.email || "",
                        telefono: profile.telefono || "",
                        direccion: profile.direccion || "",
                    });
                    if (profile.fotoUrl) {
                        setFotoPreview(profile.fotoUrl);
                    }
                }
            })
            .catch(() => {});
        loadNotifications().catch(() => {});
        loadOrders().catch(() => {});
        api.addresses().then(setAddrs).catch(() => {});
        api.notificationPrefs().then(setPrefs).catch(() => {});
    }, [refreshProfile, loadNotifications, loadOrders]);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });
    const handlePassword = (e) => setPassword({ ...password, [e.target.name]: e.target.value });

    const handleSaveProfile = async () => {
        try {
            const updated = await updateProfile(data);
            setData({
                nombre: updated.nombre || "",
                email: updated.email || "",
                telefono: updated.telefono || "",
                direccion: updated.direccion || "",
            });
            setMessage("Perfil actualizado");
            setEditMode(false);
        } catch (err) {
            setMessage(err.message || "No se pudo actualizar");
        }
    };

    const handleChangePassword = async () => {
        if (password.nueva !== password.confirmar) {
            setMessage("Las contraseñas no coinciden");
            return;
        }
        try {
            await changePassword({ currentPassword: password.actual, newPassword: password.nueva });
            setMessage("Contraseña cambiada");
            setPassword({ actual: "", nueva: "", confirmar: "" });
            await login(user.username, password.nueva);
        } catch (err) {
            setMessage(err.message || "No se pudo cambiar la contraseña");
        }
    };

    const handleFotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFotoPreview(URL.createObjectURL(file));
        try {
            await api.uploadPhoto(file); // reutilizamos endpoint antiguo
            setMessage("Foto actualizada");
            await refreshProfile();
        } catch (err) {
            setMessage(err.message || "No se pudo subir la foto");
        }
    };

    const saveAddress = async () => {
        const payload = { ...addrForm };
        try {
            if (addrForm.id) {
                await api.addressUpdate(addrForm.id, payload);
            } else {
                await api.addressCreate(payload);
            }
            const list = await api.addresses();
            setAddrs(list);
            setAddrForm({
                etiqueta: "",
                nombre: "",
                telefono: "",
                direccion: "",
                ciudad: "",
                estado: "",
                pais: "",
                zipCode: "",
                principal: false,
            });
            setMessage("Dirección guardada");
        } catch (err) {
            setMessage(err.message || "No se pudo guardar la dirección");
        }
    };

    const editAddress = (addr) => {
        setAddrForm({ ...addr });
    };

    const deleteAddress = async (id) => {
        await api.addressDelete(id);
        const list = await api.addresses();
        setAddrs(list);
    };

    const savePrefs = async () => {
        await api.updateNotificationPrefs(prefs);
        setMessage("Preferencias actualizadas");
    };

    const deleteAccount = async () => {
        const email = window.prompt("Ingresa tu correo para confirmar la eliminación de la cuenta");
        if (!email) return;
        try {
            await api.deleteAccount(email);
            setMessage("Cuenta eliminada. Serás deslogueado.");
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (err) {
            setMessage(err.message || "No se pudo eliminar la cuenta");
        }
    };

    return (
        <>
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 mt-10">
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600 mb-8">Gestiona tu información personal y preferencias</p>

                {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">{message}</p>}

                <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="perfil" className="w-28 h-28 rounded-full object-cover shadow" />
                            ) : (
                                <div className="w-28 h-28 bg-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow">
                                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "C"}
                                </div>
                            )}

                            <label className="absolute bottom-1 right-1 bg-white border cursor-pointer rounded-full p-1 shadow hover:bg-gray-100">
                                <PhotoIcon className="w-5 h-5 text-blue-600" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                            </label>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold">{data.nombre || "Cliente"}</h2>
                            <p className="text-gray-500">{data.email}</p>

                            <span className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                <ShieldCheckIcon className="w-4 h-4" />
                                {user?.rol || "Cliente"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Información Personal</h3>

                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Editar
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        className="px-4 py-2 bg-gray-300 rounded-lg"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        onClick={handleSaveProfile}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <InputField icon={<UserIcon />} label="Nombre Completo" name="nombre" value={data.nombre} editMode={editMode} onChange={handleChange} />
                            <InputField icon={<EnvelopeIcon />} label="Correo Electronico" name="email" value={data.email} editMode={editMode} onChange={handleChange} />
                            <InputField icon={<PhoneIcon />} label="Telefono" name="telefono" value={data.telefono} editMode={editMode} onChange={handleChange} />
                            <InputField icon={<MapPinIcon />} label="Direccion" name="direccion" value={data.direccion} editMode={editMode} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                    <h3 className="text-lg font-bold mb-4">Seguridad</h3>

                    <div className="grid grid-cols-3 gap-6">
                        <SecureInput label="Contraseña Actual" name="actual" value={password.actual} onChange={handlePassword} />
                        <SecureInput label="Nueva Contraseña" name="nueva" value={password.nueva} onChange={handlePassword} />
                        <SecureInput label="Confirmar Contraseña" name="confirmar" value={password.confirmar} onChange={handlePassword} />
                    </div>

                    <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleChangePassword}>
                        Cambiar Contraseña
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Direcciones</h3>
                        <button
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
                            onClick={() => setAddrForm({
                                etiqueta: "",
                                nombre: "",
                                telefono: "",
                                direccion: "",
                                ciudad: "",
                                estado: "",
                                pais: "",
                                zipCode: "",
                                principal: false,
                            })}
                        >
                            Nueva dirección
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {addrs.map((a) => (
                            <div key={a.id} className="border rounded-lg p-3">
                                <p className="font-semibold">{a.nombre}</p>
                                <p className="text-sm text-gray-600">{a.direccion}</p>
                                <p className="text-sm text-gray-600">{a.telefono}</p>
                                {a.principal && <span className="text-xs text-green-600">Principal</span>}
                                <div className="mt-2 flex gap-2">
                                    <button className="text-blue-600 text-xs" onClick={() => editAddress(a)}>Editar</button>
                                    <button className="text-red-600 text-xs" onClick={() => deleteAddress(a.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-3">
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Etiqueta" value={addrForm.etiqueta || ""} onChange={(e) => setAddrForm({ ...addrForm, etiqueta: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Nombre" value={addrForm.nombre || ""} onChange={(e) => setAddrForm({ ...addrForm, nombre: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Teléfono" value={addrForm.telefono || ""} onChange={(e) => setAddrForm({ ...addrForm, telefono: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Dirección" value={addrForm.direccion || ""} onChange={(e) => setAddrForm({ ...addrForm, direccion: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Ciudad" value={addrForm.ciudad || ""} onChange={(e) => setAddrForm({ ...addrForm, ciudad: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Estado" value={addrForm.estado || ""} onChange={(e) => setAddrForm({ ...addrForm, estado: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="País" value={addrForm.pais || ""} onChange={(e) => setAddrForm({ ...addrForm, pais: e.target.value })} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="ZIP" value={addrForm.zipCode || ""} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={addrForm.principal || false} onChange={(e) => setAddrForm({ ...addrForm, principal: e.target.checked })} />
                            Dirección principal
                        </label>
                        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={saveAddress}>Guardar dirección</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                    <h3 className="text-lg font-bold mb-4">Preferencias de Notificaciones</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <ToggleItem
                            title="Promociones"
                            desc="Descuentos y ofertas"
                            icon={<BellAlertIcon className="w-6 h-6 text-blue-500" />}
                            value={prefs.promociones}
                            onChange={() => setPrefs({ ...prefs, promociones: !prefs.promociones })}
                        />
                        <ToggleItem
                            title="Alertas por email"
                            desc="Te enviaremos correos"
                            icon={<InboxStackIcon className="w-6 h-6 text-blue-500" />}
                            value={prefs.emailAlerts}
                            onChange={() => setPrefs({ ...prefs, emailAlerts: !prefs.emailAlerts })}
                        />
                        <ToggleItem
                            title="Estado de pedidos"
                            desc="Actualizaciones de tus compras"
                            icon={<InboxStackIcon className="w-6 h-6 text-blue-500" />}
                            value={prefs.orderUpdates}
                            onChange={() => setPrefs({ ...prefs, orderUpdates: !prefs.orderUpdates })}
                        />
                    </div>
                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded" onClick={savePrefs}>
                        Guardar preferencias
                    </button>
                </div>

                <div className="bg-red-50 border border-red-300 p-6 rounded-2xl shadow mb-16">
                    <h3 className="text-lg font-bold text-red-700 mb-4">Zona de Peligro</h3>

                    <button onClick={deleteAccount} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
                        <TrashIcon className="w-5 h-5" />
                        Eliminar Cuenta
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-10">
                    <h3 className="text-lg font-bold mb-4">Mis Pedidos</h3>
                    {orders.length === 0 && <p className="text-sm text-gray-500">Aún no tienes pedidos.</p>}
                    {orders.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">ID</th>
                                        <th className="p-2 text-left">Estado</th>
                                        <th className="p-2 text-left">Pago</th>
                                        <th className="p-2 text-left">Total</th>
                                        <th className="p-2 text-left">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} className="border-b">
                                            <td className="p-2">#{o.id}</td>
                                            <td className="p-2">{o.status}</td>
                                            <td className="p-2">{o.paymentStatus}</td>
                                            <td className="p-2">S/ {o.total}</td>
                                            <td className="p-2">
                                                <button
                                                    className="text-blue-600 text-xs underline"
                                                    onClick={async () => {
                                                        try {
                                                            const r = await api.receipt(o.id);
                                                            setReceipt(r);
                                                            setMessage("Comprobante cargado.");
                                                        } catch (err) {
                                                            setMessage(err.message || "No se pudo obtener el comprobante");
                                                        }
                                                    }}
                                                >
                                                    Ver comprobante
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {receipt && (
                        <div className="mt-4 border rounded-lg p-3 bg-gray-50 text-sm">
                            <p className="font-semibold">Comprobante de pago</p>
                            <p>Orden: #{receipt.orderId}</p>
                            <p>Método: {receipt.paymentMethod}</p>
                            <p>Estado: {receipt.paymentStatus}</p>
                            {receipt.operationCode && <p>Código operación: {receipt.operationCode}</p>}
                            {receipt.voucherUrl && (
                                <a href={receipt.voucherUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">
                                    Ver voucher
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function InputField({ icon, label, name, value, editMode, onChange, type = "text" }) {
    return (
        <div>
            <label className="text-sm text-gray-500">{label}</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 bg-gray-50">
                <span className="w-5 h-5 text-gray-400">{icon}</span>
                {editMode ? (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-transparent outline-none"
                    />
                ) : (
                    <p className="text-gray-700">{value}</p>
                )}
            </div>
        </div>
    );
}

function SecureInput({ label, name, value, onChange }) {
    return (
        <div>
            <label className="text-sm text-gray-600">{label}</label>
            <input
                type="password"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 bg-gray-50 outline-none"
            />
        </div>
    );
}

function ToggleItem({ title, desc, icon, value, onChange }) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg mb-3">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                </div>
            </div>

            <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={value} onChange={onChange} />
                <span className={`w-10 h-5 flex items-center rounded-full p-1 transition ${value ? "bg-blue-600" : "bg-gray-300"}`}>
                    <span
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition 
                        ${value ? "translate-x-5" : "translate-x-0"}`}
                    ></span>
                </span>
            </label>
        </div>
    );
}
