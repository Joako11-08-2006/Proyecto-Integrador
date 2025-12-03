// src/components/SalesReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ventasStats, productos } from "../api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const downloadCsv = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

const formatSoles = (n) => `S/ ${Number(n || 0).toLocaleString("es-PE")}`;

export default function SalesReport() {
  const [period, setPeriod] = useState("dia");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    ventasStats()
      .then((res) => setStats(res || {}))
      .catch(() => setStats({}));
    productos().then((res) => setProducts(res || [])).catch(() => {});
  }, []);

  const dataByPeriod = useMemo(() => {
    if (!stats) return { resumen: null, ventas: [], ingresos: [] };

    const sources = {
      dia: {
        ventas: stats.ventas_por_dia || stats.ventas_dia || [],
        ingresos: stats.ingresos_por_dia || stats.ingresos_dia || [],
      },
      semana: {
        ventas: stats.ventas_por_semana || stats.ventas_semana || [],
        ingresos: stats.ingresos_por_semana || stats.ingresos_semana || [],
      },
      mes: {
        ventas: stats.ventas_por_mes || stats.ventas_mes || [],
        ingresos: stats.ingresos_por_mes || stats.ingresos_mes || [],
      },
    };
    const current = sources[period] || { ventas: [], ingresos: [] };
    return {
      resumen: {
        totalVentas: stats.total_ventas ?? 0,
        ingresosTotales: stats.ingresos_totales ?? 0,
        ticketPromedio: stats.ticket_promedio ?? 0,
        cambioVentas: stats.cambio_ventas ?? "",
        cambioIngresos: stats.cambio_ingresos ?? "",
        cambioTicket: stats.cambio_ticket ?? "",
      },
      ventas: current.ventas || [],
      ingresos: current.ingresos || [],
      topProducts: stats.top_products || [],
    };
  }, [stats, period]);

  const { resumen, ventas, ingresos, topProducts } = dataByPeriod;

  const handleExport = () => {
    if (!ventas.length && !ingresos.length) return;
    const rows = [
      ...ventas.map((v) => ({
        seccion: "ventas",
        periodo: v.name || v.etiqueta || v.label || v.periodo,
        valor: v.valor ?? v.total ?? v.ventas ?? 0,
      })),
      ...ingresos.map((v) => ({
        seccion: "ingresos",
        periodo: v.name || v.etiqueta || v.label || v.periodo,
        valor: v.valor ?? v.total ?? v.ingresos ?? 0,
      })),
    ];
    downloadCsv(rows, `reporte_${period}.xlsx`);
  };

  const EmptyState = ({ text }) => (
    <div className="h-64 flex items-center justify-center text-sm text-gray-500 bg-white rounded-xl border border-gray-100">
      {text}
    </div>
  );

  return (
    <section className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">📊</span>
            <h2 className="text-xl font-semibold text-gray-800">Reportes de Ventas</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Análisis detallado por período. Cambia entre día, semana y mes.</p>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-full p-1 self-start">
          {[{ id: "dia", label: "Día" }, { id: "semana", label: "Semana" }, { id: "mes", label: "Mes" }].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-1 text-sm rounded-full transition ${period === p.id ? "bg-white shadow text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Ventas" value={resumen ? resumen.totalVentas : 0} badge={resumen?.cambioVentas} color="blue" />
        <SummaryCard title="Ingresos Totales" value={resumen ? formatSoles(resumen.ingresosTotales) : "S/ 0"} badge={resumen?.cambioIngresos} color="emerald" />
        <SummaryCard title="Ticket Promedio" value={resumen ? formatSoles(resumen.ticketPromedio) : "S/ 0"} subtitle="Por transacción" badge={resumen?.cambioTicket} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Ventas {period === "dia" ? "por Hora" : period === "semana" ? "por Día" : "por Semana"}
              </p>
              <p className="text-xs text-gray-500">
                {period === "dia" ? "Distribución de ventas por hora" : period === "semana" ? "Distribución de ventas por día" : "Distribución de ventas por semana"}
              </p>
            </div>
            <button onClick={handleExport} className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50">
              Exportar
            </button>
          </div>

          {ventas.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventas} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={(v) => v.name || v.etiqueta || v.label || v.periodo} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey={(v) => v.valor ?? v.total ?? v.ventas ?? 0} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Sin datos de ventas." />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Ingresos {period === "dia" ? "por Hora" : period === "semana" ? "por Día" : "por Semana"}
              </p>
              <p className="text-xs text-gray-500">
                {period === "dia" ? "Evolución de ingresos por hora" : period === "semana" ? "Evolución de ingresos por día" : "Evolución de ingresos por semana"}
              </p>
            </div>
          </div>

          {ingresos.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ingresos} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={(v) => v.name || v.etiqueta || v.label || v.periodo} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey={(v) => v.valor ?? v.total ?? v.ingresos ?? 0} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Sin datos de ingresos." />
          )}
        </div>
      </div>

      {/* Productos más vendidos (Top 5) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Productos Más Vendidos</h3>
        <p className="text-xs text-gray-500 mb-4">Top 5 en el período seleccionado</p>

        {topProducts && topProducts.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Ranking</th>
                  <th className="py-2 pr-4 font-medium">Producto</th>
                  <th className="py-2 pr-4 font-medium">Marca</th>
                  <th className="py-2 pr-4 font-medium">Unidades</th>
                  <th className="py-2 pr-4 font-medium">Ingresos</th>
                  <th className="py-2 pr-4 font-medium">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-none">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-800">{item.nombre || item.producto || "-"}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                        {item.marca || item.brand || "N/D"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{(item.unidades ?? item.quantity ?? 0)} unidades</td>
                    <td className="py-3 pr-4 text-blue-600 font-medium">
                      {formatSoles(item.ingresos ?? item.total ?? 0)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          (item.tendencia || "+0%").startsWith("-")
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.tendencia || "+0%"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-6">Sin datos de productos top.</div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ title, value, subtitle, badge, color }) {
  const bg = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }[color] || "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bg}`}>📈</div>
      </div>
      {badge && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
          ▲ {badge}
        </p>
      )}
    </div>
  );
}
