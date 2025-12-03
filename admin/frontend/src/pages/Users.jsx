import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import api from "../api";
import { Snackbar, Alert } from "@mui/material";

export default function Users() {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setMsgError] = useState("");
  const [search, setSearch] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    nombre: "",
    email: "",
    telefono: "",
    rol: "Cliente",
    permisos_extra: {
      ver_productos: true,
      ver_reportes: false,
      gestionar_promociones: false,
      gestionar_inventario: false,
      gestionar_usuarios: false,
      procesar_ordenes: false,
    },
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clientes/");
      setUsers(res.data);
    } catch (err) {
      setMsgError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeNew = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    try {
      await api.post("/clientes/", newUser);
      setShowModal(false);
      setMsgSuccess("Usuario creado");
      fetchUsers();
      setNewUser({
        username: "",
        password: "",
        nombre: "",
        email: "",
        telefono: "",
        rol: "Cliente",
        permisos_extra: {
          ver_productos: true,
          ver_reportes: false,
          gestionar_promociones: false,
          gestionar_inventario: false,
          gestionar_usuarios: false,
          procesar_ordenes: false,
        },
      });
    } catch (err) {
      setMsgError("No se pudo crear el usuario");
    }
  };

  const handleUpdate = async (user) => {
    try {
      const payload = {
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        permisos_extra: user.permisos_extra || {},
      };
      await api.patch(`/clientes/${user.id}/`, payload);
      setMsgSuccess("Usuario actualizado");
      fetchUsers();
      setEditUser(null);
      setShowModal(false);
    } catch (err) {
      setMsgError("No se pudo actualizar el usuario");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/clientes/${id}/`);
      setMsgSuccess("Usuario eliminado");
      fetchUsers();
    } catch (err) {
      setMsgError("No se pudo eliminar el usuario");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.nombre || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.usuario_username || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="p-10 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800">Gestion de Usuarios y Roles</h1>
        <p className="text-gray-600 mb-6">
          Administra usuarios, roles y permisos del sistema
        </p>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Total usuarios: {users.length} {loading && "(actualizando...)"} 
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nombre o email"
                className="pl-9 pr-3 py-2 border rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700"
            >
              <AiOutlinePlus size={18} /> Nuevo Usuario
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Email</th>
                <th className="p-3">Telefono</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">{u.usuario_username || u.nombre}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-gray-600">{u.telefono}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.rol === "SuperAdmin"
                          ? "bg-red-100 text-red-700"
                          : u.rol === "Admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setEditUser({
                          ...u,
                          permisos_extra: u.permisos_extra || {},
                        });
                        setShowModal(true);
                      }}
                      title="Editar"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteUser(u.id)}
                      title="Eliminar"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <UserModal
            user={editUser || newUser}
            isEdit={Boolean(editUser)}
            handleChange={(field, value) => {
              if (editUser) {
                setEditUser((prev) => ({ ...prev, [field]: value }));
              } else {
                handleChangeNew(field, value);
              }
            }}
            handlePermChange={(key, value) => {
              const updater = (prev) => ({
                ...prev,
                permisos_extra: { ...(prev.permisos_extra || {}), [key]: value },
              });
              if (editUser) setEditUser((prev) => updater(prev));
              else setNewUser((prev) => updater(prev));
            }}
            onClose={() => {
              setShowModal(false);
              setEditUser(null);
            }}
            onSave={() => {
              if (editUser) handleUpdate(editUser);
              else handleCreateUser();
            }}
          />
        )}
      </div>

      <Snackbar
        open={Boolean(msgSuccess)}
        autoHideDuration={3000}
        onClose={() => setMsgSuccess("")}
      >
        <Alert severity="success">{msgSuccess}</Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(msgError)}
        autoHideDuration={3000}
        onClose={() => setMsgError("")}
      >
        <Alert severity="error">{msgError}</Alert>
      </Snackbar>
    </div>
  );
}

function UserModal({ user, isEdit, handleChange, handlePermChange, onClose, onSave }) {
  const perms = user.permisos_extra || {};
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">
            {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            x
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          {isEdit
            ? "Modifica la información del usuario"
            : "Completa los datos para crear un nuevo usuario"}
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={user.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            className="border p-3 rounded-lg"
          />

          {!isEdit && (
            <>
              <input
                type="text"
                placeholder="Usuario"
                value={user.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="border p-3 rounded-lg"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            placeholder="Telefono"
            value={user.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <select
            value={user.rol}
            onChange={(e) => handleChange("rol", e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option>Cliente</option>
            <option>Admin</option>
            <option>SuperAdmin</option>
          </select>
        </div>

        <div className="mt-4 border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Permisos</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Toggle label="Ver Productos" value={perms.ver_productos} onChange={(v) => handlePermChange("ver_productos", v)} />
            <Toggle label="Gestionar Inventario" value={perms.gestionar_inventario} onChange={(v) => handlePermChange("gestionar_inventario", v)} />
            <Toggle label="Ver Reportes" value={perms.ver_reportes} onChange={(v) => handlePermChange("ver_reportes", v)} />
            <Toggle label="Gestionar Usuarios" value={perms.gestionar_usuarios} onChange={(v) => handlePermChange("gestionar_usuarios", v)} />
            <Toggle label="Gestionar Promociones" value={perms.gestionar_promociones} onChange={(v) => handlePermChange("gestionar_promociones", v)} />
            <Toggle label="Procesar Órdenes" value={perms.procesar_ordenes} onChange={(v) => handlePermChange("procesar_ordenes", v)} />
          </div>
        </div>

        <div className="flex justify-between mt-5">
          <button
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={onSave}
          >
            {isEdit ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}
