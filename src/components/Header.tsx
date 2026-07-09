import { Search, Plus, Settings } from "lucide-react";
import type { ViewType } from "@/types";

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export function Header({ onViewChange }: HeaderProps) {

  return (
    <>
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Transactions"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewChange("add-sale")}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sale
          </button>
          <button
            onClick={() => onViewChange("add-purchase")}
            className="bg-[#1976D2] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Purchase
          </button>
          <button
            onClick={() => onViewChange("settings")}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </>
  );
}
