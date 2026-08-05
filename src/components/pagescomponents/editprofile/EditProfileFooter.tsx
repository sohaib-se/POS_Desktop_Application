interface EditProfileFooterProps {
  onBack?: () => void;
  onSave: () => void;
}

export function EditProfileFooter({ onBack, onSave }: EditProfileFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
      <button
        onClick={onBack}
        className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
}
