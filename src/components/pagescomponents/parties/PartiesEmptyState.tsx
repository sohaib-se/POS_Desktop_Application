import { Phone, Settings, Printer, Plus } from "lucide-react";

interface PartiesEmptyStateProps {
  onAddParty: () => void;
  isReportView?: boolean;
}

export function PartiesEmptyState({ onAddParty, isReportView }: PartiesEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full text-center py-12 px-4 bg-white m-1 rounded-md shadow-sm">
      <div className="w-32 h-32 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl transform rotate-6" />
        <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
          <Phone className="w-16 h-16 text-gray-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
          <span className="text-blue-800 text-lg font-bold">P</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
          <span className="text-blue-800 text-sm font-bold">p</span>
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Manage Your Parties
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        With Vyapar, you can organize all your customers and suppliers in one place, track their balances, and manage transactions easily.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8 w-full">
        <div className="bg-blue-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Contact Details
          </h3>
          <p className="text-xs text-gray-500">
            Keep track of phone numbers, emails, and addresses for all your parties.
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Credit Limits
          </h3>
          <p className="text-xs text-gray-500">
            Set custom credit limits and manage opening balances for each party.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-left">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Printer className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">
            Transaction History
          </h3>
          <p className="text-xs text-gray-500">
            View, print, and export complete transaction history for any party.
          </p>
        </div>
      </div>

      {!isReportView && (
        <button
          onClick={onAddParty}
          className="bg-[#E53935] hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          Add Party
        </button>
      )}
    </div>
  );
}
