interface BulkUpdateFooterProps {
  updatesCount: number;
  onUpdate: () => void;
  isUpdating: boolean;
}

export function BulkUpdateFooter({ updatesCount, onUpdate, isUpdating }: BulkUpdateFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="px-4 py-2 bg-[#F6EFE5] rounded-md text-sm text-gray-500">
        <span className="font-semibold text-[#5B6376]">Total</span> - {updatesCount} items with pending updates
      </div>
      <button 
        onClick={onUpdate}
        disabled={isUpdating || updatesCount === 0}
        className={`px-8 py-2 text-white font-medium rounded-md text-sm transition-colors ${
          isUpdating || updatesCount === 0 
            ? 'bg-[#B2B8C6] cursor-not-allowed opacity-70' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUpdating ? 'Updating...' : 'Update'}
      </button>
    </div>
  );
}
