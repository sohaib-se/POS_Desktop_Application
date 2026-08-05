export function AutoBackupSettings() {
  return (
    <div className="p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Enable Auto Backup
          </h3>
          <p className="text-xs text-gray-500">
            Creates backups on a schedule.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
          Enable
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
