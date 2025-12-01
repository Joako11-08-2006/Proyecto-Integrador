import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartBrands({ products = [] }) {
  const brandCounts = products.reduce((acc, p) => {
    const brand =
      p.categoria_nombre ||
      (p.categoria && p.categoria.nombre) ||
      p.marca ||
      p.brand ||
      "Otros";
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(brandCounts);
  const values = Object.values(brandCounts);

  if (!labels.length) {
    return <p className="text-sm text-gray-500">Sin datos de marcas.</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#3B82F6",
          "#22C55E",
          "#F59E0B",
          "#A855F7",
          "#6B7280",
          "#0EA5E9",
          "#10B981",
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
