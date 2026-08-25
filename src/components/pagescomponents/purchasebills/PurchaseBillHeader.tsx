import {Plus, ArrowLeft } from "lucide-react";

interface PurchaseBillHeaderProps {
  onAddPurchase: () => void;
  onBack?: () => void;
}

export function PurchaseBillHeader({ onAddPurchase, onBack }: PurchaseBillHeaderProps) {
  return (
    <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full mr-1 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">Purchase Bills</h2>
      </div>
      <button
        onClick={onAddPurchase}
        className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Purchase
      </button>
    </div>
  );
}
