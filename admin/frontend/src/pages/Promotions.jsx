import React, { useEffect, useState } from "react";
import api from "../api";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    descuento: 0,
    activo: true,
    producto: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [productos, setProductos] = useState([]);

  const loadPromos = async () => {
    try {
      const res = await api.get("/promociones/");
      setPromos(res.data);
    } catch (err) {
      console.error("Error cargando promociones", err);
    }
  };

  const loadProductos = async () => {
    try {
      const res = await api.get("/productos/");
      setProductos(res.data);
    } catch (err) {
      console.error("Error cargando productos", err);
    }
  };

  useEffect(() => {
    loadPromos();
    loadProductos();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await api.post("/promociones/", {
        ...form,
        producto: form.producto || null,
      });
      setForm({
        nombre: "",
        descripcion: "",
        descuento: 0,
        activo: true,
        producto: "",
        fecha_inicio: "",
        fecha_fin: "",
      });
      loadPromos();
    } catch (err) {
      console.error("Error creando promocion", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/promociones/${id}/`);
      loadPromos();
    } catch (err) {
      console.error("Error eliminando promocion", err);
    }
  };

  return (
    <div className="p-8 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promociones y Descuentos</h1>
          <p className="text-gray-600">Crea y administra promociones activas.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Nueva promoción</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              placeholder="Nombre"
              className="border rounded-lg px-3 py-2"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
            <input
              placeholder="Descuento (%)"
              type="number"
              className="border rounded-lg px-3 py-2"
              value={form.descuento}
              onChange={(e) => handleChange("descuento", e.target.value)}
            />
            <select
              className="border rounded-lg px-3 py-2"
              value={form.producto}
              onChange={(e) => handleChange("producto", e.target.value)}
            >
              <option value="">Aplicar a todos</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <input
              placeholder="Fecha inicio"
              type="date"
              className="border rounded-lg px-3 py-2"
              value={form.fecha_inicio}
              onChange={(e) => handleChange("fecha_inicio", e.target.value)}
            />
            <input
              placeholder="Fecha fin"
              type="date"
              className="border rounded-lg px-3 py-2"
              value={form.fecha_fin}
              onChange={(e) => handleChange("fecha_fin", e.target.value)}
            />
            <input
              placeholder="Descripción"
              className="border rounded-lg px-3 py-2 md:col-span-3"
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => handleChange("activo", e.target.checked)}
              />
              Activa
            </label>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FiPlus /> Guardar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Promociones actuales</h2>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Descuento</th>
                <th className="p-2">Producto</th>
                <th className="p-2">Vigencia</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.descuento}%</td>
                  <td className="p-2">{p.producto_nombre || "Todos"}</td>
                  <td className="p-2">
                    {p.fecha_inicio || "-"} / {p.fecha_fin || "-"}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.activo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {p.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
