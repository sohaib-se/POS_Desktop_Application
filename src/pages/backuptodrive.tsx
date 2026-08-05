import { useState } from "react";
import { BackupToDriveHeader } from "@/components/pagescomponents/backup/backuptodrive/BackupToDriveHeader";
import { BackupToDriveSettings } from "@/components/pagescomponents/backup/backuptodrive/BackupToDriveSettings";
import { BackupDriveModal } from "@/components/pagescomponents/backup/backuptodrive/BackupDriveModal";

export function BackupToDrive() {
  const [showBackupDrive, setShowBackupDrive] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="max-w-3xl">
        <BackupToDriveHeader />
        <BackupToDriveSettings onBackupNow={() => setShowBackupDrive(true)} />
      </div>

      <BackupDriveModal
        showBackupDrive={showBackupDrive}
        setShowBackupDrive={setShowBackupDrive}
        backupInProgress={backupInProgress}
        onStartBackup={() => {
          setBackupInProgress(true);
          setTimeout(() => {
            setBackupInProgress(false);
            setShowBackupDrive(false);
          }, 2000);
        }}
      />
    </div>
  );
}
