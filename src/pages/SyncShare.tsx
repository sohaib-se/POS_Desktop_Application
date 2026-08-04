import { useState } from "react";
import { LogOut, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SyncShareTab =
  | "sync-share"
  | "auto-backup"
  | "backup-computer"
  | "backup-drive"
  | "restore-backup";

interface SyncShareProps {
  initialTab?: SyncShareTab;
}

export function SyncShare({ initialTab = "sync-share" }: SyncShareProps) {
  const [showBackupDrive, setShowBackupDrive] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const activeTab = initialTab;

  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="max-w-3xl">
        {activeTab === "sync-share" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              Sync & Share
              <span className="text-amber-400">👑</span>
            </h2>

            <div className="mt-6 p-6 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-600 mb-4">
                Currently logged in with the following number:
              </p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-medium text-gray-900">
                  3198224949
                </span>
                <button className="text-red-500 hover:text-red-600">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                Enable Sync
              </button>

              <div className="mt-6 flex justify-end">
                <button className="text-blue-600 text-sm hover:text-blue-700">
                  Logout from Sync
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "auto-backup" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Auto Backup
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure automatic backups to keep your data safe.
            </p>
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
          </div>
        )}

        {activeTab === "backup-computer" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Backup to Computer
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a local backup file on this device.
            </p>
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
          </div>
        )}

        {activeTab === "backup-drive" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Backup to Drive
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Store your backups securely on Google Drive.
            </p>
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
                  onClick={() => setShowBackupDrive(true)}
                  className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium"
                >
                  Backup Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "restore-backup" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Restore Backup
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Restore data from a previous backup file.
            </p>
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
          </div>
        )}
      </div>

      {/* Backup Drive Modal */}
      <Dialog open={showBackupDrive} onOpenChange={setShowBackupDrive}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Backup To Drive</span>
              <button
                onClick={() => setShowBackupDrive(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-2xl">☁</span>
            </div>
            <p className="text-gray-600 mb-4">
              Backup your data to Google Drive
            </p>
            <button
              onClick={() => {
                setBackupInProgress(true);
                setTimeout(() => {
                  setBackupInProgress(false);
                  setShowBackupDrive(false);
                }, 2000);
              }}
              className="bg-[#1976D2] text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              {backupInProgress ? "Backing up..." : "Start Backup"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
