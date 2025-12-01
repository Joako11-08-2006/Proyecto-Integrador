import React, { useEffect, useState } from "react";
import api from "../api";

export default function ProductForm({ selectedProduct, onSaved, onCancel }) {
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    imagen_url: "",
    descuento: "",
  });

  const [categorias, setCategorias] = useState([]);

  // Cargar categorias desde Django
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categorias/");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorias", err);
      }
    };
    fetchCategorias();
  }, []);

  // Cargar datos al editar
  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        id: selectedProduct.id,
        nombre: selectedProduct.nombre,
        descripcion: selectedProduct.descripcion || "",
        precio: selectedProduct.precio,
        stock: selectedProduct.stock,
        categoria: selectedProduct.categoria || "",
        imagen_url: selectedProduct.imagen_url || "",
        descuento: selectedProduct.descuento || 0,
      });
    } else {
      setFormData({
        id: null,
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria: "",
        imagen_url: "",
        descuento: "",
      });
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar producto (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock, 10),
      categoria: formData.categoria || null,
      imagen_url: formData.imagen_url,
      descuento: formData.descuento === "" ? 0 : parseFloat(formData.descuento),
    };

    try {
      if (formData.id) {
        await api.put(`/productos/${formData.id}/`, payload);
      } else {
        await api.post("/productos/", payload);
      }

      onSaved();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto.");
    }
  };

  return (
    <div className="p-4 bg-white border rounded-xl shadow">
      <h2 className="text-lg font-bold mb-3">
        {formData.id ? "Editar Producto" : "Nuevo Producto"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          name="nombre"
          placeholder="Nombre"
          className="input"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <input
          name="precio"
          type="number"
          step="0.01"
          placeholder="Precio"
          className="input"
          value={formData.precio}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          className="input"
          value={formData.stock}
          onChange={handleChange}
          required
        />

        <select
          name="categoria"
          className="input"
          value={formData.categoria}
          onChange={handleChange}
        >
          <option value="">Sin categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <input
          name="imagen_url"
          placeholder="URL imagen"
          className="input col-span-2"
          value={formData.imagen_url}
          onChange={handleChange}
        />

        <input
          name="descuento"
          type="number"
          step="0.01"
          placeholder="Descuento %"
          className="input"
          value={formData.descuento}
          onChange={handleChange}
        />

        <textarea
          name="descripcion"
          placeholder="Descripcion"
          className="input col-span-2"
          value={formData.descripcion}
          onChange={handleChange}
        />

        <div className="col-span-2 flex justify-between mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {formData.id ? "Guardar Cambios" : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
