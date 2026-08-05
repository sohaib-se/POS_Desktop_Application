export function BackupToComputerSettings() {
  return (
    <div className="p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Destination Folder</p>
          <p className="text-sm font-medium text-gray-900">
            C:\\Backups\\Vyapar
          </p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
          Change Folder
        </button>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium">
          Create Backup
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
          View Backups
        </button>
      </div>
    </div>
  );
}
