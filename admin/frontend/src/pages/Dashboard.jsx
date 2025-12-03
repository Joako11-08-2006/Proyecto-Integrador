import React, { useEffect, useMemo, useState } from "react";
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

  const mockStats = useMemo(() => {
    const totalVentas = stats?.total_ventas || 200;
    const precios = (products || []).map((p) => Number(p.precio) || 1200);
    const avgPrecio = precios.length ? precios.reduce((a, b) => a + b, 0) / precios.length : 1200;
    const baseSemanas = [0.8, 1.0, 1.2, 1.1];
    const ventasSemana = baseSemanas.map((f, idx) => ({
      name: `Sem ${idx + 1}`,
      valor: Math.round((totalVentas / baseSemanas.length) * f),
    }));
    const ingresosSemana = ventasSemana.map((v) => ({ ...v, valor: Math.round(v.valor * avgPrecio) }));

    const topProducts = (products || [])
      .map((p) => {
        const unidades = Number(p.stock) || 0;
        const ingreso = (Number(p.precio) || 0) * unidades;
        return {
          nombre: p.nombre,
          marca: p.categoria?.nombre || p.categoria || "N/D",
          ingresos: ingreso,
          unidades,
          tendencia: "+0%",
        };
      })
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);

    const ingresosTotales = ingresosSemana.reduce((a, b) => a + (b.valor || 0), 0);
    return {
      ingresos_totales: ingresosTotales,
      total_ventas: totalVentas,
      ticket_promedio: ingresosTotales / (totalVentas || 1),
      cambio_ingresos: "+0%",
      cambio_ventas: "+0%",
      cambio_ticket: "+0%",
      ventas_por_semana: ventasSemana,
      ingresos_por_semana: ingresosSemana,
      top_products: topProducts,
    };
  }, [stats, products]);

  const resolvedStats = useMemo(() => {
    if (!stats) return mockStats;
    const ingresos = stats.ingresos_totales ?? 0;
    if (ingresos === 0) return mockStats;
    return stats;
  }, [stats, mockStats]);

  const totalVentas = resolvedStats?.total_ventas ?? 0;
  const ingresosFallback = (products || []).reduce((acc, p) => {
    const precio = Number(p.precio) || 0;
    const stock = Number(p.stock) || 0;
    return acc + precio * stock;
  }, 0);
  const ingresosTotales = (resolvedStats?.ingresos_totales ?? 0) || ingresosFallback;
  const cambioIngresos = resolvedStats?.cambio_ingresos ?? "+0%";
  const cambioVentas = resolvedStats?.cambio_ventas ?? "+0%";
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
            {activeTab === "ventas" && <ChartSales data={resolvedStats?.ventas_por_semana || resolvedStats?.ventas || []} />}
            {activeTab === "ingresos" && <ChartIncome data={resolvedStats?.ingresos_por_semana || resolvedStats?.ingresos || []} />}
            {activeTab === "productos" && (
              <ChartTopProducts
                data={
                  resolvedStats?.top_products?.length
                    ? resolvedStats.top_products
                    : (products || [])
                        .map((p) => ({
                          nombre: p.nombre,
                          marca: p.categoria?.nombre || p.categoria || "N/D",
                          unidades: Number(p.stock) || 0,
                          ingresos: (Number(p.precio) || 0) * (Number(p.stock) || 0),
                          tendencia: "+0%",
                        }))
                        .sort((a, b) => b.unidades - a.unidades)
                        .slice(0, 5)
                }
              />
            )}
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
