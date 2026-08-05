export function RestoreBackupSettings() {
  return (
    <div className="p-6 border border-gray-200 rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backup Source
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Computer</option>
            <option>Google Drive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backup File
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Select backup file"
          />
        </div>
      </div>
      <div className="mt-6">
        <button className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium">
          Restore Now
        </button>
      </div>
    </div>
  );
}
