import React, { useState } from "react";
import { FiPlus, FiX, FiEye, FiDownload } from "react-icons/fi";

export default function Comprobantes() {
  const [openModal, setOpenModal] = useState(false);
  const [tipo, setTipo] = useState("Boleta");
  const [cliente, setCliente] = useState("");
  const [productos, setProductos] = useState([
    { nombre: "", cantidad: 1, precio: 0 },
  ]);

  const comprobantes = [
    {
      id: "INV-001",
      tipo: "FACTURA",
      cliente: "Empresa TechCorp S.A.",
      fecha: "2025-09-29",
      total: 4023,
      estado: "Pagado",
    },
    {
      id: "BOL-001",
      tipo: "BOLETA",
      cliente: "Cliente Particular",
      fecha: "2025-09-28",
      total: 536,
      estado: "Pagado",
    },
    {
      id: "INV-002",
      tipo: "FACTURA",
      cliente: "Comercial Digital Ltda.",
      fecha: "2025-09-27",
      total: 3177,
      estado: "Pendiente",
    },
  ];

  const totalFacturado = comprobantes.reduce((a, b) => a + b.total, 0);
  const emitidos = comprobantes.length;
  const pendientes = comprobantes.filter((c) => c.estado === "Pendiente").length;

  // -----------------------------
  // MODAL PARA EMITIR COMPROBANTE
  // -----------------------------

  const addProducto = () => {
    setProductos([...productos, { nombre: "", cantidad: 1, precio: 0 }]);
  };

  const updateProducto = (index, field, value) => {
    const copia = [...productos];
    copia[index][field] = value;
    setProductos(copia);
  };

  return (
    <div className="p-8 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">

        {/* TITULO */}
        <h1 className="text-2xl font-bold text-gray-800">Comprobantes de Venta</h1>
        <p className="text-gray-600 mb-6">Gestiona boletas y facturas</p>

        {/* BOTÓN EMITIR */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow"
          >
            <FiPlus className="mr-2" /> Emitir Comprobante
          </button>
        </div>

        {/* TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Total Facturado</p>
            <h2 className="text-2xl font-bold text-blue-600">${totalFacturado}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Comprobantes Emitidos</p>
            <h2 className="text-2xl font-bold text-blue-600">{emitidos}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Pendientes de Pago</p>
            <h2 className="text-2xl font-bold text-orange-500">{pendientes}</h2>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="p-4">ID</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {comprobantes.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{c.id}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.tipo === "FACTURA"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {c.tipo}
                    </span>
                  </td>
                  <td className="p-4">{c.cliente}</td>
                  <td className="p-4">{c.fecha}</td>
                  <td className="p-4 text-blue-600 font-bold">${c.total}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        c.estado === "Pagado"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td className="p-4 flex gap-4 text-gray-600">
                    <FiEye className="cursor-pointer hover:text-blue-600" size={18} />
                    <FiDownload className="cursor-pointer hover:text-green-600" size={18} />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* ------------------------------ */}
        {/* MODAL: EMITIR COMPROBANTE      */}
        {/* ------------------------------ */}

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative animate-fade">

              {/* Boton cerrar */}
              <button
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                onClick={() => setOpenModal(false)}
              >
                <FiX size={22} />
              </button>

              <h2 className="text-xl font-bold mb-1">Emitir Comprobante</h2>
              <p className="text-gray-600 mb-4">Crea una nueva boleta o factura</p>

              {/* FORMULARIO */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">Tipo de Comprobante</label>
                  <select
                    className="w-full border rounded-lg p-2 mt-1"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option>Boleta</option>
                    <option>Factura</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Cliente</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 mt-1"
                    placeholder="Nombre del cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                  />
                </div>
              </div>

              {/* PRODUCTOS */}
              <h3 className="font-semibold mb-2">Productos</h3>

              {productos.map((p, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Producto"
                    className="border p-2 rounded-lg"
                    value={p.nombre}
                    onChange={(e) =>
                      updateProducto(index, "nombre", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="border p-2 rounded-lg"
                    value={p.cantidad}
                    onChange={(e) =>
                      updateProducto(index, "cantidad", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    className="border p-2 rounded-lg"
                    value={p.precio}
                    onChange={(e) =>
                      updateProducto(index, "precio", e.target.value)
                    }
                  />
                </div>
              ))}

              <button
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg mt-2"
                onClick={addProducto}
              >
                <FiPlus className="mr-2" />
                Agregar
              </button>

              {/* BOTONES */}
              <div className="flex justify-between mt-6">
                <button
                  className="px-4 py-2 border rounded-lg"
                  onClick={() => setOpenModal(false)}
                >
                  Cancelar
                </button>

                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Emitir Comprobante
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
