import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ChartIncome({ data: serverData = [] }) {
  const labels = serverData.length
    ? serverData.map((v) => v.name || v.etiqueta || v.label || v.semana || v.mes || v.hora)
    : [];
  const values = serverData.length
    ? serverData.map((v) => v.valor ?? v.total ?? v.ingresos ?? 0)
    : [];

  if (!labels.length) {
    return <p className="text-sm text-gray-500">Sin datos de ingresos.</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Ingresos (S/)",
        data: values,
        backgroundColor: "#22C55E",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { color: "#6B7280" },
        grid: { color: "#E5E7EB" },
      },
      x: {
        ticks: { color: "#6B7280" },
        grid: { display: false },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
