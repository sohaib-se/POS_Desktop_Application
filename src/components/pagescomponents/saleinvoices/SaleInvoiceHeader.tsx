import { ChevronDown, Plus, ArrowLeft } from "lucide-react";
import type { ViewType } from "@/types";

interface SaleInvoiceHeaderProps {
  onViewChange: (view: ViewType) => void;
  onBack?: () => void;
}

export function SaleInvoiceHeader({ onViewChange, onBack }: SaleInvoiceHeaderProps) {
  return (
    <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full mr-1 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">Sale Invoices</h2>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
      <button
        onClick={() => onViewChange("add-sale")}
        className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Sale
      </button>
    </div>
  );
}
