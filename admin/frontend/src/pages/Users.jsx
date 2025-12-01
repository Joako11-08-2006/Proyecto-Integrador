import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import api from "../api";
import { Snackbar, Alert } from "@mui/material";

export default function Users() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setMsgError] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    nombre: "",
    email: "",
    telefono: "",
    rol: "Cliente",
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
      });
    } catch (err) {
      setMsgError("No se pudo crear el usuario");
    }
  };

  const handleUpdateRol = async (id, rol) => {
    try {
      await api.patch(`/clientes/${id}/`, { rol });
      setMsgSuccess("Rol actualizado");
      fetchUsers();
    } catch (err) {
      setMsgError("No se pudo actualizar el rol");
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

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-blue-700"
          >
            <AiOutlinePlus size={18} /> Nuevo Usuario
          </button>
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
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">{u.usuario_username || u.nombre}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-gray-600">{u.telefono}</td>
                  <td className="p-3">
                    <select
                      value={u.rol}
                      onChange={(e) => handleUpdateRol(u.id, e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option>Cliente</option>
                      <option>Admin</option>
                      <option>SuperAdmin</option>
                    </select>
                  </td>
                  <td className="p-3 flex gap-3">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteUser(u.id)}
                      title="Eliminar"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <span className="text-gray-400">
                      <FiEdit2 size={18} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <UserModal
            newUser={newUser}
            handleChange={handleChangeNew}
            onClose={() => setShowModal(false)}
            onSave={handleCreateUser}
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

function UserModal({ newUser, handleChange, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            x
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Completa los datos para crear un nuevo usuario
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={newUser.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="text"
            placeholder="Usuario"
            value={newUser.username}
            onChange={(e) => handleChange("username", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => handleChange("password", e.target.value)}
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
            placeholder="Telefono"
            value={newUser.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            className="border p-3 rounded-lg"
          />

          <select
            value={newUser.rol}
            onChange={(e) => handleChange("rol", e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option>Cliente</option>
            <option>Admin</option>
            <option>SuperAdmin</option>
          </select>
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
            Crear Usuario
          </button>
        </div>
      </div>
    </div>
  );
}
