import { ArrowLeft } from 'lucide-react';

interface BillWiseProfitProps {
  onBack: () => void;
}

export function BillWiseProfit({ onBack }: BillWiseProfitProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Bill Wise Profit</h1>
      </div>
      <div className="p-6 flex-1 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-center py-8">Bill Wise Profit report coming soon...</p>
        </div>
      </div>
    </div>
  );
}
