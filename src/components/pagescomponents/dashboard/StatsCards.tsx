import { ArrowDown, ArrowUp } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Total Receivable */}
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Receivable</p>
            <p className="text-2xl font-bold text-gray-900">Rs 200</p>
            <p className="text-xs text-gray-500 mt-1">From 1 Party</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Payable */}
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">Rs 100</p>
            <p className="text-xs text-gray-500 mt-1">From 1 Party</p>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
