import { ChevronDown, Calendar, Building2 } from "lucide-react";

export function PaymentOutFilters() {
  return (
    <div
      className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4 shrink-0"
      style={{ marginLeft: "4px", marginRight: "4px" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by :</span>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
          This Month
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Between</span>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Calendar className="w-4 h-4" />
          01/02/2026
        </button>
        <span className="text-sm text-gray-500">To</span>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Calendar className="w-4 h-4" />
          28/02/2026
        </button>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
        <Building2 className="w-4 h-4" />
        All Firms
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
