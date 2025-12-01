import React, { useEffect, useState } from "react";
import api from "../api";
import ProductForm from "./ProductForm";

function ProductList() {
  const [productos, setProductos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProductos = async () => {
    try {
      const res = await api.get("/productos/");
      setProductos(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar productos. Revisa tu sesion.");
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEdit = (producto) => {
    setSelectedProduct(producto);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}/`);
      fetchProductos();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto.");
    }
  };

  const handleSaved = () => {
    setSelectedProduct(null);
    fetchProductos();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <h2>Gestion de productos (Administrador)</h2>

      <ProductForm
        selectedProduct={selectedProduct}
        onSaved={handleSaved}
        onCancel={() => setSelectedProduct(null)}
      />

      <h3 style={{ marginTop: "2rem" }}>Listado de productos</h3>
      <table border="1" cellPadding="6" style={{ width: "100%", marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoria</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 && (
            <tr>
              <td colSpan="6">No hay productos</td>
            </tr>
          )}
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.stock}</td>
              <td>{p.categoria || "-"}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ marginLeft: "0.5rem" }}
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
}

export default ProductList;
