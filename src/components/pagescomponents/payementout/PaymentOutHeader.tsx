import { Plus } from "lucide-react";

interface PaymentOutHeaderProps {
  onAddPayment: () => void;
}

export function PaymentOutHeader({ onAddPayment }: PaymentOutHeaderProps) {
  return (
    <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Payment-Out</h2>
      </div>
      <button
        onClick={onAddPayment}
        className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Payment-Out
      </button>
    </div>
  );
}
