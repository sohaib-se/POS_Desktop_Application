interface BackupToDriveSettingsProps {
  onBackupNow: () => void;
}

export function BackupToDriveSettings({ onBackupNow }: BackupToDriveSettingsProps) {
  return (
    <div className="p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Drive Status</p>
          <p className="text-sm font-medium text-gray-900">
            Not connected
          </p>
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
          Connect Drive
        </button>
      </div>
      <div className="mt-6">
        <button
          onClick={onBackupNow}
          className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium"
        >
          Backup Now
        </button>
      </div>
    </div>
  );
}
