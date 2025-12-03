import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiX, FiEye, FiDownload, FiRefreshCcw } from "react-icons/fi";
import {
  productos as fetchProductos,
  getComprobantes,
  getComprobante,
  createComprobante,
  updateEstadoComprobante,
} from "../api";

const formatMoney = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
const capitalize = (txt) => (txt ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : "");

export default function Comprobantes() {
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [formTipo] = useState("BOLETA"); // único tipo permitido
  const [formCliente, setFormCliente] = useState("");
  const [items, setItems] = useState([{ producto_id: "", cantidad: 1, precio: 0 }]);

  const [detalle, setDetalle] = useState(null);

  const totalFacturado = useMemo(
    () => comprobantes.reduce((acc, c) => acc + Number(c.total || 0), 0),
    [comprobantes]
  );
  const emitidos = comprobantes.length;
  const pendientes = comprobantes.filter((c) => c.estado === "PENDIENTE").length;

  const loadProductos = async () => {
    try {
      const data = await fetchProductos();
      setProductos(data);
    } catch (e) {
      console.error("Error cargando productos", e);
    }
  };

  const loadComprobantes = async () => {
    try {
      setLoading(true);
      const res = await getComprobantes();
      setComprobantes(res.data || res);
    } catch (e) {
      console.error("Error cargando comprobantes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
    loadComprobantes();
  }, []);

  const addItem = () => {
    setItems([...items, { producto_id: "", cantidad: 1, precio: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const copia = [...items];
    copia[index] = { ...copia[index], [field]: value };
    if (field === "producto_id") {
      const prod = productos.find((p) => String(p.id) === String(value));
      copia[index].precio = prod ? Number(prod.precio) : 0;
    }
    if (field === "cantidad") {
      copia[index].cantidad = Math.max(1, Number(value || 1));
    }
    setItems(copia);
  };

  const totalForm = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.precio || 0) * Number(it.cantidad || 0), 0),
    [items]
  );

  const resetForm = () => {
    // tipo fijo, no se reinicia
    setFormCliente("");
    setItems([{ producto_id: "", cantidad: 1, precio: 0 }]);
  };

  const handleCrear = async () => {
    const payloadItems = items
      .filter((i) => i.producto_id)
      .map((i) => ({
        producto_id: i.producto_id,
        cantidad: Number(i.cantidad || 1),
      }));

    if (!payloadItems.length) {
      alert("Agrega al menos un producto.");
      return;
    }

    const payload = {
      tipo: "BOLETA",
      cliente: null, // cliente opcional, el modelo lo admite como null
      estado: "PENDIENTE",
      items: payloadItems,
    };

    try {
      setLoading(true);
      await createComprobante(payload);
      await loadComprobantes();
      resetForm();
      setOpenModal(false);
    } catch (e) {
      console.error("Error creando comprobante", e);
      alert("No se pudo emitir el comprobante.");
    } finally {
      setLoading(false);
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await updateEstadoComprobante(id, estado);
      setComprobantes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado } : c))
      );
    } catch (e) {
      console.error("Error cambiando estado", e);
    }
  };

  const handleDetalle = async (id) => {
    try {
      setLoadingDetalle(true);
      const res = await getComprobante(id);
      setDetalle(res.data || res);
    } catch (e) {
      console.error("Error obteniendo detalle", e);
      setDetalle(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleDescargar = (comp) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const itemsHtml = (comp.items || [])
      .map(
        (it) =>
          `<tr><td>${it.producto_nombre || ""}</td><td>${it.cantidad}</td><td>${formatMoney(
            it.precio_unitario
          )}</td><td>${formatMoney(it.subtotal)}</td></tr>`
      )
      .join("");
    win.document.write(`
      <html><head><title>Comprobante ${comp.id}</title></head><body>
      <h2>${capitalize(comp.tipo)} ${comp.id}</h2>
      <p>Cliente: ${comp.cliente_nombre || comp.cliente || "Sin cliente"}</p>
      <p>Estado: ${capitalize(comp.estado)}</p>
      <p>Fecha: ${comp.fecha || ""}</p>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3>Total: ${formatMoney(comp.total)}</h3>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="p-8 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Comprobantes de Venta</h1>
            <p className="text-gray-600">Gestiona boletas y facturas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadComprobantes}
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow"
            >
              <FiRefreshCcw className="mr-2" /> Recargar
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg shadow"
            >
              <FiPlus className="mr-2" /> Emitir Comprobante
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Total Facturado</p>
            <h2 className="text-2xl font-bold text-blue-600">{formatMoney(totalFacturado)}</h2>
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
              {loading && (
                <tr>
                  <td className="p-4" colSpan={7}>Cargando...</td>
                </tr>
              )}
              {!loading && comprobantes.map((c) => (
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
                  <td className="p-4">{c.cliente_nombre || c.cliente || "Sin cliente"}</td>
                  <td className="p-4">{(c.fecha || "").substring(0, 10)}</td>
                  <td className="p-4 text-blue-600 font-bold">{formatMoney(c.total)}</td>
                  <td className="p-4">
                    <select
                      className={`px-3 py-1 rounded-full text-sm ${
                        c.estado === "PAGADO"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-600"
                      }`}
                      value={c.estado}
                      onChange={(e) => handleEstado(c.id, e.target.value)}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PAGADO">Pagado</option>
                    </select>
                  </td>
                  <td className="p-4 flex gap-4 text-gray-600">
                    <FiEye
                      className="cursor-pointer hover:text-blue-600"
                      size={18}
                      onClick={() => handleDetalle(c.id)}
                    />
                    <FiDownload
                      className="cursor-pointer hover:text-green-600"
                      size={18}
                      onClick={() => handleDescargar(c)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {openModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative animate-fade">
              <button
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                onClick={() => setOpenModal(false)}
              >
                <FiX size={22} />
              </button>

              <h2 className="text-xl font-bold mb-1">Emitir Comprobante</h2>
              <p className="text-gray-600 mb-4">Crea una nueva boleta o factura</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">Tipo de Comprobante</label>
                  <input
                    className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
                    value="Boleta"
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Cliente (opcional)</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2 mt-1"
                    placeholder="Nombre del cliente"
                    value={formCliente}
                    onChange={(e) => setFormCliente(e.target.value)}
                  />
                </div>
              </div>

              <h3 className="font-semibold mb-2">Productos</h3>

              {items.map((p, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
                  <select
                    className="border p-2 rounded-lg col-span-2"
                    value={p.producto_id}
                    onChange={(e) => updateItem(index, "producto_id", e.target.value)}
                  >
                    <option value="">Selecciona producto</option>
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} ({prod.categoria_nombre}) - {formatMoney(prod.precio)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="border p-2 rounded-lg"
                    value={p.cantidad}
                    onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                  />
                  <input
                    type="text"
                    className="border p-2 rounded-lg bg-gray-100"
                    value={formatMoney(p.precio)}
                    disabled
                  />
                </div>
              ))}

              <button
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg mt-2"
                onClick={addItem}
              >
                <FiPlus className="mr-2" />
                Agregar
              </button>

              <div className="flex justify-between mt-6">
                <div className="text-gray-700 font-semibold">Total: {formatMoney(totalForm)}</div>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 border rounded-lg"
                    onClick={() => setOpenModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={handleCrear}
                    disabled={loading}
                  >
                    Emitir Comprobante
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {detalle && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative animate-fade">
              <button
                className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
                onClick={() => setDetalle(null)}
              >
                <FiX size={22} />
              </button>

              <h2 className="text-xl font-bold mb-1">
                {capitalize(detalle.tipo)} {detalle.id}
              </h2>
              <p className="text-gray-600 mb-4">Detalle del comprobante</p>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
                <div>Cliente: {detalle.cliente_nombre || detalle.cliente || "Sin cliente"}</div>
                <div>Estado: {capitalize(detalle.estado)}</div>
                <div>Fecha: {(detalle.fecha || "").substring(0, 10)}</div>
                <div>Total: {formatMoney(detalle.total)}</div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2">Producto</th>
                    <th className="py-2">Cant.</th>
                    <th className="py-2">Precio</th>
                    <th className="py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(detalle.items || []).map((it) => (
                    <tr key={it.id} className="border-b">
                      <td className="py-2">{it.producto_nombre}</td>
                      <td className="py-2">{it.cantidad}</td>
                      <td className="py-2">{formatMoney(it.precio_unitario)}</td>
                      <td className="py-2">{formatMoney(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right font-semibold text-gray-800">
                Total: {formatMoney(detalle.total)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
