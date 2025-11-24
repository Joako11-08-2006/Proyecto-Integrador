import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";

export default function Users() {
  const [showModal, setShowModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Cliente",
    permisos: {
      productos: true,
      reportes: false,
      usuarios: false,
      promociones: false,
      ordenes: false,
    },
  });

  const handleChange = (field, value) => {
    setNewUser({ ...newUser, [field]: value });
  };

  const togglePermiso = (permiso) => {
    setNewUser({
      ...newUser,
      permisos: {
        ...newUser.permisos,
        [permiso]: !newUser.permisos[permiso],
      },
    });
  };

  return (
    <div className="p-10 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">
        
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios y Roles</h1>
        <p className="text-gray-600 mb-6">Administra usuarios, roles y permisos del sistema</p>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Usuarios" value="5" icon="👤" />
          <MetricCard title="SuperAdmins" value="1" icon="🛡️" />
          <MetricCard title="Admins" value="2" icon="⭐" />
          <MetricCard title="Clientes" value="2" icon="📦" />
        </div>

        {/* BUSCADOR Y BOTÓN */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-80 p-3 border rounded-lg shadow-sm"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700"
          >
            <AiOutlinePlus size={18} /> Nuevo Usuario
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Último Acceso</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {[
                {
                  nombre: "Juan Pérez",
                  email: "juan.perez@example.com",
                  telefono: "+1 234 567 890",
                  rol: "SuperAdmin",
                  color: "red",
                  estado: "Activo",
                  acceso: "26/10/2024",
                },
                {
                  nombre: "María García",
                  email: "maria.garcia@example.com",
                  telefono: "+1 234 567 891",
                  rol: "Admin",
                  color: "blue",
                  estado: "Activo",
                  acceso: "25/10/2024",
                },
              ].map((u, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 h-9 w-9 flex items-center justify-center rounded-full font-bold">
                        {u.nombre[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{u.nombre}</p>
                        <p className="text-gray-500 text-sm">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-sm text-gray-600">{u.telefono}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        u.color === "red"
                          ? "bg-red-500"
                          : u.color === "blue"
                          ? "bg-blue-500"
                          : "bg-green-600"
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {u.estado}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600">{u.acceso}</td>

                  <td className="p-3 flex gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiEdit2 size={18} />
                    </button>

                    <button className="text-red-600 hover:text-red-800">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showModal && (
          <UserModal
            newUser={newUser}
            handleChange={handleChange}
            togglePermiso={togglePermiso}
            onClose={() => setShowModal(false)}
          />
        )}

      </div>
    </div>
  );
}

/* ---- COMPONENTE METRIC CARD ---- */
function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex flex-col">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}

/* ---- MODAL CREAR USUARIO ---- */
function UserModal({ newUser, handleChange, togglePermiso, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">Completa los datos para crear un nuevo usuario</p>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Nombre Completo"
            value={newUser.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            placeholder="Teléfono"
            value={newUser.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <select
            value={newUser.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option>Cliente</option>
            <option>Admin</option>
            <option>SuperAdmin</option>
          </select>

          {/* PERMISOS */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <PermisoItem 
              label="Ver Productos" 
              value={newUser.permisos.productos} 
              onToggle={() => togglePermiso("productos")}
            />
            <PermisoItem 
              label="Ver Reportes" 
              value={newUser.permisos.reportes} 
              onToggle={() => togglePermiso("reportes")}
            />
            <PermisoItem 
              label="Gestionar Usuarios" 
              value={newUser.permisos.usuarios} 
              onToggle={() => togglePermiso("usuarios")}
            />
            <PermisoItem 
              label="Gestionar Promociones" 
              value={newUser.permisos.promociones} 
              onToggle={() => togglePermiso("promociones")}
            />
            <PermisoItem 
              label="Procesar Órdenes" 
              value={newUser.permisos.ordenes} 
              onToggle={() => togglePermiso("ordenes")}
            />
          </div>

          {/* BOTONES */}
          <div className="flex justify-between mt-4">
            <button
              className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Crear Usuario
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---- SWITCH DE PERMISOS ---- */
function PermisoItem({ label, value, onToggle }) {
  return (
    <label className="flex justify-between items-center text-sm text-gray-700">
      {label}
      <input
        type="checkbox"
        checked={value}
        onChange={onToggle}
        className="toggle-switch"
      />
    </label>
  );
}
