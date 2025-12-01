import React, { useState } from "react";
import { EnvelopeIcon, PhoneIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [form, setForm] = useState({
        username: "",
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        password: "",
        confirm: "",
    });
    const [message, setMessage] = useState(null);
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (form.password !== form.confirm) {
            setMessage("Las contrasenas no coinciden");
            return;
        }
        try {
            await register({
                username: form.username,
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono,
                direccion: form.direccion,
                password: form.password,
            });
            navigate("/home");
        } catch (err) {
            setMessage(err.message || "No se pudo registrar");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-white shadow-xl rounded-2xl p-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Crear Cuenta</h2>
                    <p className="text-gray-600 mb-6">Unete a TecnoMarket y descubre las mejores ofertas</p>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Field
                            label="Nombre Completo"
                            icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                            placeholder="Juan Perez"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />

                        <Field
                            label="Username (usa esto para iniciar sesion)"
                            icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                            placeholder="usuario123"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />

                        <Field
                            label="Correo Electronico"
                            icon={<EnvelopeIcon className="w-5 h-5 text-gray-400" />}
                            placeholder="tu@email.com"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        <Field
                            label="Telefono"
                            icon={<PhoneIcon className="w-5 h-5 text-gray-400" />}
                            placeholder="+51 987 654 321"
                            value={form.telefono}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        />

                        <Field
                            label="Direccion"
                            icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                            placeholder="Calle 123"
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        />

                        <PasswordField
                            label="Contrasena"
                            show={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />

                        <PasswordField
                            label="Confirmar Contrasena"
                            show={showPassword2}
                            onToggle={() => setShowPassword2(!showPassword2)}
                            value={form.confirm}
                            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                        />

                        <div className="flex items-start space-x-2">
                            <input type="checkbox" className="mt-1" required />
                            <p className="text-gray-600 text-sm">
                                Acepto los <span className="text-blue-600 underline cursor-pointer">Terminos y Condiciones</span> y la{" "}
                                <span className="text-blue-600 underline cursor-pointer">Politica de Privacidad</span>.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow-md hover:opacity-90 transition"
                            disabled={loading}
                        >
                            {loading ? "Creando cuenta..." : "Crear Cuenta"}
                        </button>

                        {message && <p className="text-center text-red-600 text-sm">{message}</p>}
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        Ya tienes una cuenta?{" "}
                        <Link to="/" className="text-blue-600 hover:underline">Inicia sesion</Link>
                    </p>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <h2 className="text-2xl font-bold text-green-700">Unete a TecnoMarket</h2>
                    <p className="text-gray-600">Miles de clientes satisfechos</p>

                    <Feature icon="⭐" title="Ofertas Exclusivas" text="Accede a descuentos antes que nadie." />
                    <Feature icon="⚡" title="Compra Rapida" text="Finaliza tus compras en segundos." />
                    <Feature icon="📦" title="Seguimiento de Pedidos" text="Rastrea tus compras en tiempo real." />
                    <Feature icon="🎧" title="Soporte Prioritario" text="Atencion dedicada a tus dudas." />

                    <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                        <h3 className="font-semibold text-green-700">100% Seguro</h3>
                        <p className="text-gray-600 text-sm">Tus datos estan protegidos con cifrado de nivel bancario.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, icon, value, onChange, placeholder, type = "text" }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                {icon}
                <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full bg-transparent pl-2 outline-none"
                    value={value}
                    onChange={onChange}
                    required
                />
            </div>
        </div>
    );
}

function PasswordField({ label, show, onToggle, value, onChange }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                <input
                    type={show ? "text" : "password"}
                    placeholder="********"
                    className="w-full bg-transparent pl-2 outline-none"
                    value={value}
                    onChange={onChange}
                    required
                />
                <button type="button" onClick={onToggle} className="text-sm text-blue-600">
                    {show ? "Ocultar" : "Ver"}
                </button>
            </div>
        </div>
    );
}

function Feature({ icon, title, text }) {
    return (
        <div className="flex items-start space-x-3">
            <span className="text-xl">{icon}</span>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-gray-600">{text}</p>
            </div>
        </div>
    );
}
