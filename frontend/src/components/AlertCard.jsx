import { FiAlertTriangle, FiBox } from "react-icons/fi";

export default function AlertCard() {
  return (
    <div className="bg-orange-50 border border-orange-300 text-orange-700 p-5 rounded-xl mb-8 shadow-sm">
      <div className="flex items-center gap-3 font-semibold text-orange-700 mb-3">
        <FiAlertTriangle className="text-xl" />
        Stock Bajo (1)
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
        <div className="flex items-center gap-3">
          <FiBox className="text-orange-500 text-xl" />
          <p className="text-orange-700 font-medium">
            Xiaomi Redmi Note 13 Pro – 8 unidades
          </p>
        </div>

        <button className="text-orange-700 font-bold px-3 py-1 hover:bg-orange-200 rounded">
          ✕
        </button>
      </div>
    </div>
  );
}
