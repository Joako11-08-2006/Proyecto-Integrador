import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartBrands() {
  const data = {
    labels: ["Apple", "Samsung", "Xiaomi", "Google", "Otros"],
    datasets: [
      {
        data: [35, 30, 20, 10, 5],
        backgroundColor: [
          "#3B82F6",
          "#22C55E",
          "#F59E0B",
          "#A855F7",
          "#6B7280",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
    },
  };

  return <Doughnut data={data} options={options} />;
}
