import { ChevronDown, Calendar, Building2 } from "lucide-react";

export function EstimatesFilters({ 
  selectedMonth, 
  onMonthChange 
}: { 
  selectedMonth: string; 
  onMonthChange: (month: string) => void;
}) {
  return (
    <div
      className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4 shrink-0"
      style={{ marginLeft: "4px", marginRight: "4px" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by Month :</span>
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
