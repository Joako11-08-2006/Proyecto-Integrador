import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [nuevoUsuario, setNuevoUsuario] = useState({ username: "", password: "" });
    const [editando, setEditando] = useState(null);

    const token = localStorage.getItem("token"); // Asegúrate de guardar el token al hacer login

    const api = axios.create({
        baseURL: "http://localhost:8080/api/usuarios",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    // 📥 Obtener usuarios
    const fetchUsuarios = async () => {
        try {
            const res = await api.get("/");
            setUsuarios(res.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // ➕ Crear usuario
    const crearUsuario = async () => {
        if (!nuevoUsuario.username || !nuevoUsuario.password) return;
        try {
            await api.post("/", nuevoUsuario);
            setNuevoUsuario({ username: "", password: "" });
            fetchUsuarios();
        } catch (error) {
            console.error("Error al crear usuario:", error);
        }
    };

    // ✏️ Actualizar usuario
    const actualizarUsuario = async (id) => {
        try {
            await api.put(`/${id}`, editando);
            setEditando(null);
            fetchUsuarios();
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    };

    // 🗑️ Eliminar usuario
    const eliminarUsuario = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        try {
            await api.delete(`/${id}`);
            fetchUsuarios();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Gestión de Usuarios 👥</h2>

            {/* Formulario de creación */}
            <div className="card p-4 mb-4 shadow-sm">
                <h5>Agregar Nuevo Usuario</h5>
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={nuevoUsuario.username}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Contraseña"
                            value={nuevoUsuario.password}
                            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <button className="btn btn-dark w-100" onClick={crearUsuario}>
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <table className="table table-striped table-hover shadow-sm">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {usuarios.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                            {editando?.id === user.id ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editando.username}
                                    onChange={(e) => setEditando({ ...editando, username: e.target.value })}
                                />
                            ) : (
                                user.username
                            )}
                        </td>
                        <td>
                            {editando?.id === user.id ? (
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => actualizarUsuario(user.id)}
                                >
                                    Guardar
                                </button>
                            ) : (
                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => setEditando(user)}
                                >
                                    Editar
                                </button>
                            )}
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarUsuario(user.id)}
                            >
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Usuarios;
