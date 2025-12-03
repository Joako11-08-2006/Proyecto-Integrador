import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useShop } from "../context/ShopContext";

const specsList = [
  "Pantalla",
  "Procesador",
  "RAM",
  "Almacenamiento",
  "Camara",
  "Bateria",
  "Sistema Operativo",
  "Stock",
];

export default function Comparar() {
  const { products, loadProducts, addToCart } = useShop();
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    loadProducts({}).catch(() => {});
  }, [loadProducts]);

  const toggleSelect = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev.slice(-2), id]
    );
  };

  const list = products.filter((p) => seleccionados.includes(p.id)).slice(0, 3);

  const getSpec = (p, spec) => {
    const s = p.specs || {};
    switch (spec) {
      case "Pantalla":
        return s.pantalla || p.descripcion || "-";
      case "Procesador":
        return s.procesador || "-";
      case "RAM":
        return s.ram || "-";
      case "Almacenamiento":
        return s.almacenamiento || "-";
      case "Camara":
        return s.camara || "-";
      case "Bateria":
        return s.bateria || "-";
      case "Sistema Operativo":
        return s.sistema_operativo || "-";
      case "Stock":
        return s.stock ?? p.stock ?? "-";
      default:
        return "-";
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Comparador de Modelos</h1>
        <p className="text-sm text-gray-600 mb-6">Compara hasta 3 productos lado a lado</p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {products.map((p) => (
            <div
              key={p.id}
              className={`border rounded-xl p-3 cursor-pointer ${seleccionados.includes(p.id) ? "border-blue-500 shadow" : "border-gray-200"}`}
              onClick={() => toggleSelect(p.id)}
            >
              <p className="text-xs text-gray-500 mb-1">{p.nombre}</p>
              <p className="font-semibold text-blue-600">S/ {p.precio}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {list.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{p.nombre}</span>
              </div>
              <img
                src={p.imagenUrl || "https://via.placeholder.com/400x300"}
                alt={p.nombre}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <p className="text-sm text-gray-600 mb-1">{p.nombre}</p>
              <div className="flex items-baseline gap-2">
                {p.descuento > 0 && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    -{p.descuento}%
                  </span>
                )}
                {p.descuento > 0 && (
                  <span className="text-xs line-through text-gray-400">S/ {p.precio}</span>
                )}
                <p className="font-bold text-blue-600">S/ {p.precioConDescuento || p.precio}</p>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-green-600">Disponible</span>
                <button
                  className="bg-blue-600 text-white text-xs px-3 py-2 rounded"
                  onClick={() => addToCart(p.id, 1)}
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border px-3 py-2 text-left">Especificación</th>
                {list.map((p) => (
                  <th key={p.id} className="border px-3 py-2 text-left">{p.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specsList.map((spec) => (
                <tr key={spec}>
                  <td className="border px-3 py-2 font-semibold">{spec}</td>
                  {list.map((p) => (
                    <td key={p.id + spec} className="border px-3 py-2">
                      {getSpec(p, spec)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
