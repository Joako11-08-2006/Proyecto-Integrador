import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ChartSales({ data: serverData = [] }) {
  const labels = serverData.length
    ? serverData.map((v) => v.name || v.etiqueta || v.label || v.dia || v.semana || v.hora)
    : [];
  const values = serverData.length
    ? serverData.map((v) => v.valor ?? v.total ?? v.ventas ?? 0)
    : [];

  if (!labels.length) {
    return <p className="text-sm text-gray-500">Sin datos de ventas.</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Ventas",
        data: values,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6B7280" },
        grid: { color: "#E5E7EB" },
      },
      x: {
        ticks: { color: "#6B7280" },
        grid: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
}
