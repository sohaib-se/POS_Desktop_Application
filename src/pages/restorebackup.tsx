import { RestoreBackupHeader } from "@/components/pagescomponents/backup/restorebackup/RestoreBackupHeader";
import { RestoreBackupSettings } from "@/components/pagescomponents/backup/restorebackup/RestoreBackupSettings";

export function RestoreBackup() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="max-w-3xl">
        <RestoreBackupHeader />
        <RestoreBackupSettings />
      </div>
    </div>
  );
}
