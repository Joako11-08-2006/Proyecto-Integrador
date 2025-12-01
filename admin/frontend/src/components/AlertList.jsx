import React, { useEffect, useState } from "react";
import { obtenerAlertas, marcarAlertaVista } from "../api";

export default function AlertList({ onClose }) {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    const data = await obtenerAlertas();
    setAlertas(Array.isArray(data) ? data : []);
  };

  const cerrarAlerta = async (id) => {
    await marcarAlertaVista(id);
    cargarAlertas();
  };

  return (
    <div className="fixed top-20 right-10 w-96 bg-white shadow-xl rounded-xl p-4 z-50">
      <h2 className="text-xl font-bold mb-4">Alertas de Stock</h2>

      {alertas.length === 0 ? (
        <p className="text-gray-500">No hay alertas pendientes.</p>
      ) : (
        alertas.map((alerta) => (
          <div
            key={alerta.id}
            className="bg-red-100 p-3 rounded-lg flex justify-between items-center mb-2"
          >
            <span>{alerta.mensaje}</span>
            <button
              onClick={() => cerrarAlerta(alerta.id)}
              className="text-red-500 font-bold"
            >
              X
            </button>
          </div>
        ))
      )}

      <button
        onClick={onClose}
        className="mt-3 w-full bg-gray-800 text-white py-2 rounded-lg"
      >
        Cerrar
      </button>
    </div>
  );
}
