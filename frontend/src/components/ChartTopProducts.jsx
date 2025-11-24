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

export default function ChartTopProducts() {
  const data = {
    labels: [
      "iPhone 15 Pro Max",
      "Samsung S24 Ultra",
      "Google Pixel 8 Pro",
      "Xiaomi 14 Pro",
      "iPhone 14",
    ],
    datasets: [
      {
        label: "Unidades vendidas",
        data: [45, 38, 32, 28, 25],
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

  return <Bar data={data} options={options} />;
}
