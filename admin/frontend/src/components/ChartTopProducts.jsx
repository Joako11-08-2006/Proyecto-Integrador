import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ChartTopProducts({ data: topProducts = [] }) {
  const labels = topProducts.length ? topProducts.map((t) => t.nombre || t.producto || t.productName || "-") : [];
  const values = topProducts.length ? topProducts.map((t) => t.unidades || t.quantity || t.total || 0) : [];

  const data = {
    labels,
    datasets: [
      {
        label: "Unidades vendidas",
        data: values,
        backgroundColor: "#3B82F6",
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: "#E5E7EB" } },
      y: { grid: { display: false } },
    },
  };

  if (!topProducts.length) {
    return <p className="text-sm text-gray-500">No hay datos de productos top.</p>;
  }

  return <Bar data={data} options={options} />;
}
