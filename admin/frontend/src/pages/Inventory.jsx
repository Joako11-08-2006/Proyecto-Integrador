import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import api from "../api";
import ProductForm from "../components/ProductForm";
import { Snackbar, Alert } from "@mui/material";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [productEdit, setProductEdit] = useState(null);

  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setMsgError] = useState("");

  // Cargar productos de API
  const loadProducts = async () => {
    try {
      const res = await api.get("/productos/");
      setProducts(res.data);
      setFiltered(res.data);
    } catch (err) {
      setMsgError("Error cargando productos");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Buscador
  useEffect(() => {
    setFiltered(
      products.filter((p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  // Eliminar Producto
  const handleDelete = async (id) => {
    try {
      await api.delete(`/productos/${id}/`);
      setMsgSuccess("Producto eliminado");
      loadProducts();
    } catch (err) {
      setMsgError("No se pudo eliminar");
    }
  };

  return (
    <div className="p-8 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800">Gestion de Inventario</h1>
        <p className="text-gray-600 mb-6">{products.length} productos en total</p>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <FiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setProductEdit(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Nuevo Producto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoria</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{p.nombre}</td>

                  <td className="text-blue-600 font-bold">
                    {p.descuento > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                          -{p.descuento}%
                        </span>
                        <span className="line-through text-xs text-gray-400">${p.precio}</span>
                        <span>${p.precio_con_descuento || p.precio}</span>
                      </div>
                    ) : (
                      <>${p.precio}</>
                    )}
                  </td>

                  <td>{p.stock}</td>

                  <td>{p.categoria_nombre || "-"}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.stock > 5
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.stock > 5 ? "Disponible" : "Bajo stock"}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex justify-center gap-4">
                      <FiEdit2
                        className="text-blue-500 cursor-pointer"
                        size={18}
                        onClick={() => {
                          setProductEdit(p);
                          setShowModal(true);
                        }}
                      />

                      <FiTrash2
                        className="text-red-500 cursor-pointer"
                        size={18}
                        onClick={() => handleDelete(p.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[450px]">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {productEdit ? "Editar Producto" : "Nuevo Producto"}
                </h2>

                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500"
                >
                  x
                </button>
              </div>

              <ProductForm
                selectedProduct={productEdit}
                onSaved={() => {
                  setShowModal(false);
                  setMsgSuccess(
                    productEdit
                      ? "Producto actualizado"
                      : "Producto creado exitosamente"
                  );
                  loadProducts();
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}

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
    </div>
  );
}
