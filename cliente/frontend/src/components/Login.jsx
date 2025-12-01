import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    LockClosedIcon,
    XMarkIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showRecoverModal, setShowRecoverModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [form, setForm] = useState({ username: "", password: "" });
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const ADMIN_URL = process.env.REACT_APP_ADMIN_URL || "http://localhost:3000";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            const logged = await login(form.username, form.password);
            const rol = (logged?.rol || "").toUpperCase();
            if (rol === "ADMIN" || rol === "SUPERADMIN") {
                window.location.href = ADMIN_URL;
            } else {
                navigate("/home");
            }
        } catch (err) {
            setMessage(err.message || "No se pudo iniciar sesion");
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-10">
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-500 p-4 rounded-2xl shadow-md">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/3523/3523063.png"
                                    className="w-10 h-10 invert"
                                    alt="icon"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-blue-700">TecnoMarket</h1>
                                <p className="text-gray-600">Tu tienda de celulares</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Feature icon="💰" title="Los mejores precios" text="Encuentra smartphones con descuentos increibles" />
                            <Feature icon="🚚" title="Envio gratuito" text="En compras superiores a $500" />
                            <Feature icon="🛡️" title="Garantia total" text="30 dias de satisfaccion garantizada" />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                            <p className="text-gray-700 italic">
                                "La mejor experiencia de compra de celulares que he tenido. Precios increibles y envio super rapido."
                            </p>
                            <p className="text-gray-600 mt-2 font-semibold">- Cliente Satisfecho</p>
                        </div>
                    </div>

                    <div className="w-full">
                        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesion</h2>
                        <p className="text-gray-600 mb-6">Ingresa tus credenciales para continuar</p>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Usuario o Email</label>
                                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-transparent pl-2 outline-none"
                                        placeholder="usuario o correo"
                                        value={form.username}
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Contrasena</label>
                                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-transparent pl-2 outline-none"
                                        placeholder="********"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />

                                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                <p
                                    className="text-blue-600 text-sm text-right cursor-pointer hover:underline"
                                    onClick={() => setShowRecoverModal(true)}
                                >
                                    Olvidaste tu contrasena?
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg shadow-md hover:opacity-90 transition"
                                disabled={loading}
                            >
                                {loading ? "Ingresando..." : "Iniciar Sesion"}
                            </button>

                            {message && (
                                <p className="text-center text-red-600 text-sm">{message}</p>
                            )}
                        </form>

                        <p className="text-center mt-6 text-gray-600">
                            No tienes una cuenta?{" "}
                            <Link to="/register" className="text-blue-600 hover:underline">Registrate gratis</Link>
                        </p>

                        <p className="text-center mt-4 text-gray-500 text-xs">
                            Al iniciar sesion, aceptas nuestros{" "}
                            <span
                                className="underline cursor-pointer"
                                onClick={() => setShowTermsModal(true)}
                            >
                                Terminos de Servicio
                            </span>{" "}
                            y{" "}
                            <span
                                className="underline cursor-pointer"
                                onClick={() => setShowPrivacyModal(true)}
                            >
                                Politica de Privacidad
                            </span>.
                        </p>
                    </div>
                </div>
            </div>

            {showRecoverModal && (
                <Modal onClose={() => setShowRecoverModal(false)} title="Recuperar Contrasena">
                    <p className="text-gray-600 mb-4">
                        Ingresa tu correo electronico o numero de telefono y te enviaremos un enlace para restablecer tu contrasena.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                className="w-full bg-transparent pl-2 outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                className="w-full bg-transparent pl-2 outline-none"
                                placeholder="+51 987 654 321"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                            onClick={() => setShowRecoverModal(false)}
                        >
                            Cancelar
                        </button>

                        <button className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                            Enviar Enlace
                        </button>
                    </div>
                </Modal>
            )}

            {showTermsModal && (
                <Modal onClose={() => setShowTermsModal(false)} title="Terminos de Servicio">
                    <div className="max-h-[70vh] overflow-y-auto pr-3 text-gray-700 space-y-4 text-sm">
                        <p className="italic">Ultima actualizacion: 27 de noviembre de 2025</p>
                        <h3 className="font-bold text-lg">1. Aceptacion de los Terminos</h3>
                        <p>
                            Al acceder y utilizar TecnoMarket, aceptas estos terminos y todas las leyes aplicables.
                        </p>
                    </div>
                </Modal>
            )}

            {showPrivacyModal && (
                <Modal onClose={() => setShowPrivacyModal(false)} title="Politica de Privacidad">
                    <div className="max-h-[70vh] overflow-y-auto pr-3 text-gray-700 space-y-4 text-sm">
                        <p className="italic">Ultima actualizacion: 27 de noviembre de 2025</p>
                        <p>Recopilamos la informacion que nos proporcionas para operar el servicio.</p>
                    </div>
                </Modal>
            )}
        </>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="flex items-start space-x-3">
            <div className="text-2xl">{icon}</div>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-gray-600">{text}</p>
            </div>
        </div>
    );
}

function Modal({ children, onClose, title }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
                <button className="absolute right-4 top-4" onClick={onClose}>
                    <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}
