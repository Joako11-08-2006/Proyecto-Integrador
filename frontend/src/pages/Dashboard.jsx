import React, { useState } from "react";
import StatsCard from "../components/StatsCard";
import ChartSales from "../components/ChartSales";
import ChartIncome from "../components/ChartIncome"; 
import ChartBrands from "../components/ChartBrands";
import ChartTopProducts from "../components/ChartTopProducts";
import AlertCard from "../components/AlertCard";
import SalesReport from "../components/SalesReport";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("ventas");

  return (
    <div className="p-10 bg-[#f5f6fa] min-h-screen flex justify-center">
      <div className="w-full max-w-7xl">

        {/* TÍTULO */}
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-600 mb-6">Vista general de tu negocio en tiempo real</p>

        {/* ALERTA */}
        <AlertCard />

        {/* TARJETAS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <StatsCard title="Ingresos Totales" value="$45.680" subtitle="+12.5% vs mes anterior" icon="money" />
          <StatsCard title="Ventas" value="234" subtitle="+8.2% vs mes anterior" icon="cart" />
          <StatsCard title="Productos" value="10" subtitle="En inventario activo" icon="box" />
          <StatsCard title="Stock Bajo" value="1" subtitle="Requieren reabastecimiento" icon="warning" />
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
            {activeTab === "ventas" && <ChartSales />}
            {activeTab === "ingresos" && <ChartIncome />}
            {activeTab === "productos" && <ChartTopProducts />}
            {activeTab === "marcas" && <ChartBrands />}
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
