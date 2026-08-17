import { Plus, ArrowLeft } from "lucide-react";

interface PartiesHeaderProps {
  isLoading: boolean;
  onAddParty: () => void;
  isReportView?: boolean;
  onBack?: () => void;
}

export function PartiesHeader({ isLoading, onAddParty, isReportView, onBack }: PartiesHeaderProps) {
  return (
    <div className="p-4 bg-white rounded-none flex items-center justify-between shrink-0 w-full">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-2 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xl font-bold text-gray-900">{isReportView ? 'All Parties' : 'Parties'}</h2>
      </div>
      <div className="flex items-center gap-3">
        {!isReportView && (
          <button
            onClick={onAddParty}
            disabled={isLoading}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Party
          </button>
        )}
      </div>
    </div>
  );
}
