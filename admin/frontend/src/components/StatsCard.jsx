import { FiDollarSign, FiShoppingCart, FiBox, FiAlertTriangle } from "react-icons/fi";

export default function StatsCard({ title, value, subtitle, icon }) {
  const icons = {
    money: <FiDollarSign className="text-blue-500 text-3xl" />,
    cart: <FiShoppingCart className="text-green-500 text-3xl" />,
    box: <FiBox className="text-blue-400 text-3xl" />,
    warning: <FiAlertTriangle className="text-red-500 text-3xl" />,
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-gray-100">
      <div className="flex justify-between items-center">
        <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
        <div className="bg-gray-100 p-3 rounded-full">
          {icons[icon]}
        </div>
      </div>

      <p className="text-3xl font-bold text-gray-800">{value}</p>

      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
