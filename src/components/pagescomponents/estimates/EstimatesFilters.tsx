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
        <span className="text-sm text-gray-500">Filter by Month:</span>
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 outline-none cursor-pointer border border-transparent focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
