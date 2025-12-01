import React, { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import ChartSales from "../components/ChartSales";
import ChartIncome from "../components/ChartIncome"; 
import ChartBrands from "../components/ChartBrands";
import ChartTopProducts from "../components/ChartTopProducts";
import AlertCard from "../components/AlertCard";
import SalesReport from "../components/SalesReport";
import { ventasStats, productos } from "../api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("ventas");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  const formatSoles = (n) => {
    if (n === null || n === undefined) return "S/ 0";
    return `S/ ${Number(n).toLocaleString("es-PE")}`;
  };

  useEffect(() => {
    ventasStats().then((res) => setStats(res)).catch(() => {});
    productos().then((res) => setProducts(res || [])).catch(() => {});
  }, []);

  const totalVentas = stats?.total_ventas ?? 0;
  const ingresosTotales = stats?.ingresos_totales ?? 0;
  const cambioIngresos = stats?.cambio_ingresos ?? "+0%";
  const cambioVentas = stats?.cambio_ventas ?? "+0%";
  const productosActivos = products?.length ?? 0;
  const stockBajoFallback = (products || []).filter((p) => Number(p.stock) <= 5).length;
  const stockBajo = alertCount || stockBajoFallback;

  return (
    <div className="p-10 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">

        {/* TÍTULO */}
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-600 mb-6">Vista general de tu negocio en tiempo real</p>

        {/* ALERTA */}
        <AlertCard products={products} onCountChange={setAlertCount} />

        {/* TARJETAS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <StatsCard title="Ingresos Totales" value={formatSoles(ingresosTotales)} subtitle={cambioIngresos || "+0%"} icon="money" />
          <StatsCard title="Ventas" value={totalVentas} subtitle={cambioVentas || "+0%"} icon="cart" />
          <StatsCard title="Productos" value={productosActivos} subtitle="En inventario activo" icon="box" />
          <StatsCard title="Stock Bajo" value={stockBajo} subtitle="Requieren reabastecimiento" icon="warning" />
        </div>

        {/* TABS DE GRÁFICOS */}
        <div className="flex justify-between mt-10 bg-gray-200 rounded-xl overflow-hidden">
          {[
            { id: "ventas", label: "Ventas Semanales" },
            { id: "ingresos", label: "Ingresos Mensuales" },
            { id: "productos", label: "Productos Top" },
            { id: "marcas", label: "Marcas" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full py-4 text-center transition ${
                activeTab === tab.id
                  ? "bg-white font-semibold text-blue-600 shadow"
                  : "text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO DE LOS TABS */}
        <div className="mt-8 bg-white rounded-xl shadow p-6 flex justify-center">
          <div className="w-full max-w-4xl">
            {activeTab === "ventas" && <ChartSales data={stats?.ventas_por_semana || stats?.ventas || []} />}
            {activeTab === "ingresos" && <ChartIncome data={stats?.ingresos_por_semana || stats?.ingresos || []} />}
            {activeTab === "productos" && <ChartTopProducts data={stats?.top_products || []} />}
            {activeTab === "marcas" && <ChartBrands products={products} />}
          </div>
        </div>

        {/* ----------------------------------- */}
        {/* BLOQUE COMPLETO DE REPORTES DE VENTAS */}
        {/* ----------------------------------- */}
        
        <SalesReport />

      </div>
    </div>
  );
}
