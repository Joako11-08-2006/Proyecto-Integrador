import React, { useEffect, useState, useCallback } from "react";
import { FiAlertTriangle, FiBox } from "react-icons/fi";
import { obtenerAlertas } from "../api";

export default function AlertCard({ products = [], onCountChange }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);

  const actualizarCuenta = useCallback(
    (count) => {
      if (onCountChange) onCountChange(count);
    },
    [onCountChange]
  );

  const loadAlertas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerAlertas();
      const list = Array.isArray(data) ? data : [];
      setAlertas(list);
      actualizarCuenta(list.length);
    } catch (err) {
      console.error("Error cargando alertas", err);
    } finally {
      setLoading(false);
    }
  }, [actualizarCuenta]);

  useEffect(() => {
    loadAlertas();
  }, [loadAlertas]);

  const fallback = (products || [])
    .filter((p) => Number(p.stock) <= 5)
    .map((p, idx) => ({
      id: `fallback-${idx}`,
      producto_nombre: p.nombre,
      mensaje: `Stock bajo (${p.stock})`,
      fallback: true,
    }));

  const alertList = alertas.length ? alertas : fallback;

  if (loading) return null;
  if (!alertList.length) return null;

  return (
    <div className="bg-orange-50 border border-orange-300 text-orange-700 p-5 rounded-xl mb-8 shadow-sm">
      <div className="flex items-center gap-3 font-semibold text-orange-700 mb-3">
        <FiAlertTriangle className="text-xl" />
        Stock Bajo ({alertList.length})
      </div>

      {alertList.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between bg-white p-4 rounded-lg border border-orange-200 shadow-sm mb-3 last:mb-0"
        >
          <div className="flex items-center gap-3">
            <FiBox className="text-orange-500 text-xl" />
            <p className="text-orange-700 font-medium">
              {a.producto_nombre} - {a.mensaje?.match(/\(([^)]+)\)/)?.[1] || `${a.mensaje}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
