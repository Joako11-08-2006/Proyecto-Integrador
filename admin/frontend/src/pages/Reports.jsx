import React, { useEffect, useState } from "react";
import api from "../api";

export default function Reports() {
  const [stats, setStats] = useState({ total_ingresos: 0, total_ventas: 0, ventas_por_dia: [], top_productos: [] });
  const [report, setReport] = useState({ group_by: "day", items: [] });
  const [filters, setFilters] = useState({ start: "", end: "", group_by: "day" });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      const res = await api.get("/ventas/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Error cargando stats", err);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      const res = await api.get("/ventas/report/", { params });
      setReport(res.data);
    } catch (err) {
      console.error("Error cargando reporte", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const qs = new URLSearchParams(filters).toString();
    window.open(`${api.defaults.baseURL}/ventas/export/?${qs}`, "_blank");
  };

  return (
    <div className="p-8 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>
          <p className="text-gray-600">Filtra ventas por fechas y descarga CSV.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Ingresos 30d" value={`$${stats.total_ingresos || 0}`} />
          <StatCard label="Ventas 30d" value={stats.total_ventas || 0} />
          <StatCard label="Top producto" value={stats.top_productos?.[0]?.producto__nombre || "-"} />
          <StatCard label="Cantidad top" value={stats.top_productos?.[0]?.cantidad || 0} />
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={filters.start}
              onChange={(e) => setFilters({ ...filters, start: e.target.value })}
              className="border rounded-lg px-3 py-2"
              placeholder="Inicio"
            />
            <input
              type="date"
              value={filters.end}
              onChange={(e) => setFilters({ ...filters, end: e.target.value })}
              className="border rounded-lg px-3 py-2"
              placeholder="Fin"
            />
            <select
              value={filters.group_by}
              onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={loadReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                {loading ? "Cargando..." : "Consultar"}
              </button>
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                CSV
              </button>
            </div>
          </div>

          <table className="w-full text-left mt-3">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Periodo</th>
                <th className="p-2">Ventas</th>
                <th className="p-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {report.items?.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{new Date(r.periodo).toLocaleDateString()}</td>
                  <td className="p-2">{r.cantidad}</td>
                  <td className="p-2">${r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Top productos 30d</h2>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Producto</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_productos?.map((p, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{p.producto__nombre}</td>
                  <td className="p-2">{p.cantidad}</td>
                  <td className="p-2">${p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-600 text-sm">{label}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
}
