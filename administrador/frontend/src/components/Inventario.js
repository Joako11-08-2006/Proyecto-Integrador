import React, { useEffect, useState } from "react";
import productoService from "../services/productoService";
import 'bootstrap/dist/css/bootstrap.min.css';

function Inventario() {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarInventario();
    }, []);

    const cargarInventario = async () => {
        try {
            const res = await productoService.obtenerProductos();
            setProductos(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar el inventario 😢");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="fw-bold mb-4">
                <i className="bi bi-box-seam me-2"></i> Gestión de Inventario
            </h2>

            {error && (
                <div className="alert alert-danger text-center">{error}</div>
            )}

            {/* Panel de resumen */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card shadow-sm text-center">
                        <div className="card-body">
                            <h6 className="text-muted">Productos totales</h6>
                            <h3>{productos.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm text-center">
                        <div className="card-body">
                            <h6 className="text-muted">Stock bajo</h6>
                            <h3 className="text-danger">
                                {productos.filter(p => p.stock < p.stockMinimo).length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="card shadow">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="m-0">Inventario de Productos</h5>
                    <button className="btn btn-primary btn-sm">
                        + Nuevo producto
                    </button>
                </div>
                <div className="card-body">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Mínimo</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center text-muted">
                                    Sin productos registrados
                                </td>
                            </tr>
                        ) : (
                            productos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.nombre}</td>
                                    <td>{p.categoria}</td>
                                    <td>S/ {p.precio}</td>
                                    <td>{p.stock}</td>
                                    <td>{p.stockMinimo}</td>
                                    <td>{p.marca}</td>
                                    <td>{p.modelo}</td>
                                    <td>
                                        {p.estado ? (
                                            <span className="badge bg-success">Activo</span>
                                        ) : (
                                            <span className="badge bg-secondary">Inactivo</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Inventario;

