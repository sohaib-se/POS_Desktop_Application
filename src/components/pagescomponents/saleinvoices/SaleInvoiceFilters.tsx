import { Calendar, ChevronDown } from "lucide-react";
import { formatMonthLabel } from "./utils";
import type { Dispatch, SetStateAction } from "react";

interface SaleInvoiceFiltersProps {
  monthButtonLabel: string;
  isMonthMenuOpen: boolean;
  setIsMonthMenuOpen: Dispatch<SetStateAction<boolean>>;
  setOpenRowMenuId: (id: string | null) => void;
  monthOptions: string[];
  setSelectedMonthKey: (key: string) => void;
}

export function SaleInvoiceFilters({
  monthButtonLabel,
  isMonthMenuOpen,
  setIsMonthMenuOpen,
  setOpenRowMenuId,
  monthOptions,
  setSelectedMonthKey,
}: SaleInvoiceFiltersProps) {
  return (
    <div
      className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4 shrink-0"
      style={{ marginLeft: "4px", marginRight: "4px" }}
    >
      <div className="relative flex items-center gap-2">
        <span className="text-sm text-gray-500">Filter by :</span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            setIsMonthMenuOpen((previous) => !previous);
            setOpenRowMenuId(null);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
        >
          {monthButtonLabel}
          <ChevronDown className="w-4 h-4" />
        </button>

        {isMonthMenuOpen && (
          <div
            className="absolute left-0 top-full mt-2 z-20 min-w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => {
                setSelectedMonthKey("");
                setIsMonthMenuOpen(false);
              }}
            >
              All Months
            </button>
            {monthOptions.map((monthKey) => (
              <button
                key={monthKey}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => {
                  setSelectedMonthKey(monthKey);
                  setIsMonthMenuOpen(false);
                }}
              >
                {formatMonthLabel(monthKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Selected month:</span>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Calendar className="w-4 h-4" />
          {monthButtonLabel}
        </button>
      </div>
    </div>
  );
}
