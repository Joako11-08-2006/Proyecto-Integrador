// src/components/SalesReport.jsx
import React, { useState } from "react";
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

const REPORT_DATA = {
  dia: {
    resumen: {
      totalVentas: 96,
      ingresosTotales: "$8.200",
      ticketPromedio: "$85",
      cambioVentas: "+4.2%",
      cambioIngresos: "+5.8%",
      cambioTicket: "+1.3%",
    },
    ventas: [
      { name: "08:00", valor: 8 },
      { name: "10:00", valor: 15 },
      { name: "12:00", valor: 21 },
      { name: "14:00", valor: 18 },
      { name: "16:00", valor: 19 },
      { name: "18:00", valor: 11 },
      { name: "20:00", valor: 4 },
    ],
    ingresos: [
      { name: "08:00", valor: 1200 },
      { name: "10:00", valor: 2100 },
      { name: "12:00", valor: 2800 },
      { name: "14:00", valor: 2600 },
      { name: "16:00", valor: 2700 },
      { name: "18:00", valor: 1800 },
      { name: "20:00", valor: 900 },
    ],
  },
  semana: {
    resumen: {
      totalVentas: 340,
      ingresosTotales: "$72.500",
      ticketPromedio: "$213",
      cambioVentas: "+9.1%",
      cambioIngresos: "+11.4%",
      cambioTicket: "+3.2%",
    },
    ventas: [
      { name: "Lun", valor: 48 },
      { name: "Mar", valor: 52 },
      { name: "Mié", valor: 61 },
      { name: "Jue", valor: 70 },
      { name: "Vie", valor: 85 },
      { name: "Sáb", valor: 62 },
      { name: "Dom", valor: 42 },
    ],
    ingresos: [
      { name: "Lun", valor: 9500 },
      { name: "Mar", valor: 10200 },
      { name: "Mié", valor: 11800 },
      { name: "Jue", valor: 13200 },
      { name: "Vie", valor: 15000 },
      { name: "Sáb", valor: 12100 },
      { name: "Dom", valor: 9700 },
    ],
  },
  mes: {
    resumen: {
      totalVentas: 1390,
      ingresosTotales: "$370.000",
      ticketPromedio: "$266",
      cambioVentas: "+12.5%",
      cambioIngresos: "+18.3%",
      cambioTicket: "+6.4%",
    },
    // Números parecidos a tu Figma
    ventas: [
      { name: "Sem 1", valor: 280 },
      { name: "Sem 2", valor: 310 },
      { name: "Sem 3", valor: 410 },
      { name: "Sem 4", valor: 360 },
    ],
    ingresos: [
      { name: "Sem 1", valor: 72000 },
      { name: "Sem 2", valor: 89000 },
      { name: "Sem 3", valor: 118000 },
      { name: "Sem 4", valor: 93000 },
    ],
  },
};

const TOP_PRODUCTS = [
  {
    ranking: "#1",
    producto: "iPhone 15 Pro Max",
    marca: "Apple",
    unidades: 45,
    ingresos: "$58.455",
    tendencia: "+12%",
    tendenciaColor: "bg-green-100 text-green-700",
  },
  {
    ranking: "#2",
    producto: "Samsung Galaxy S24 Ultra",
    marca: "Samsung",
    unidades: 38,
    ingresos: "$45.562",
    tendencia: "+8%",
    tendenciaColor: "bg-green-100 text-green-700",
  },
  {
    ranking: "#3",
    producto: "Google Pixel 8 Pro",
    marca: "Google",
    unidades: 32,
    ingresos: "$28.768",
    tendencia: "+15%",
    tendenciaColor: "bg-green-100 text-green-700",
  },
  {
    ranking: "#4",
    producto: "Xiaomi 14 Pro",
    marca: "Xiaomi",
    unidades: 28,
    ingresos: "$22.372",
    tendencia: "+5%",
    tendenciaColor: "bg-green-100 text-green-700",
  },
  {
    ranking: "#5",
    producto: "iPhone 14",
    marca: "Apple",
    unidades: 25,
    ingresos: "$19.975",
    tendencia: "-3%",
    tendenciaColor: "bg-red-100 text-red-700",
  },
];

export default function SalesReport() {
  const [period, setPeriod] = useState("mes"); // por defecto MES (como tu Figma)
  const data = REPORT_DATA[period];

  const periodLabel =
    period === "dia" ? "por hora" : period === "semana" ? "por día" : "por semana";

  return (
    <section className="mt-12">
      {/* HEADER + FILTROS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              📊
            </span>
            <h2 className="text-xl font-semibold text-gray-800">
              Reportes de Ventas
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Análisis detallado por período. Cambia entre día, semana y mes.
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 rounded-full p-1 self-start">
          <button
            onClick={() => setPeriod("dia")}
            className={`px-4 py-1 text-sm rounded-full transition ${
              period === "dia"
                ? "bg-white shadow text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setPeriod("semana")}
            className={`px-4 py-1 text-sm rounded-full transition ${
              period === "semana"
                ? "bg-white shadow text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod("mes")}
            className={`px-4 py-1 text-sm rounded-full transition ${
              period === "mes"
                ? "bg-white shadow text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Ventas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Ventas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {data.resumen.totalVentas}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              🧾
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            ↑ {data.resumen.cambioVentas} vs período anterior
          </p>
        </div>

        {/* Ingresos Totales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {data.resumen.ingresosTotales}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              💵
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            ↑ {data.resumen.cambioIngresos} vs período anterior
          </p>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Ticket Promedio</p>
              <p className="mt-1 text-2xl font-semibold text-gray-800">
                {data.resumen.ticketPromedio}
              </p>
              <p className="text-xs text-gray-400 mt-1">Por transacción</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              🎟️
            </div>
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            ↑ {data.resumen.cambioTicket} vs período anterior
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Ventas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Ventas {period === "mes" ? "por Semana" : period === "semana" ? "por Día" : "por Hora"}
              </p>
              <p className="text-xs text-gray-500">
                Distribución de ventas {periodLabel}
              </p>
            </div>
            <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50">
              ⬇ Exportar
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ventas} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Ingresos {period === "mes" ? "por Semana" : period === "semana" ? "por Día" : "por Hora"}
              </p>
              <p className="text-xs text-gray-500">
                Evolución de ingresos {periodLabel}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.ingresos} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="valor"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLA PRODUCTOS MÁS VENDIDOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">
          Productos Más Vendidos
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Top 5 en el período seleccionado
        </p>

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
              {TOP_PRODUCTS.map((item) => (
                <tr
                  key={item.ranking}
                  className="border-b border-gray-50 last:border-none"
                >
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                      {item.ranking}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-800">{item.producto}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                      {item.marca}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    {item.unidades} unidades
                  </td>
                  <td className="py-3 pr-4 text-blue-600 font-medium">
                    {item.ingresos}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${item.tendenciaColor}`}
                    >
                      {item.tendencia}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
