import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Dispatch, SetStateAction } from "react";

interface BackupDriveModalProps {
  showBackupDrive: boolean;
  setShowBackupDrive: Dispatch<SetStateAction<boolean>>;
  backupInProgress: boolean;
  onStartBackup: () => void;
}

export function BackupDriveModal({
  showBackupDrive,
  setShowBackupDrive,
  backupInProgress,
  onStartBackup
}: BackupDriveModalProps) {
  return (
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
            onClick={onStartBackup}
            className="bg-[#1976D2] text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            {backupInProgress ? "Backing up..." : "Start Backup"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
