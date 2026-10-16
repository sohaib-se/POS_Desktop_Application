import { RestoreBackupHeader } from "@/components/pagescomponents/backup/restorebackup/RestoreBackupHeader";
import { RestoreBackupSettings } from "@/components/pagescomponents/backup/restorebackup/RestoreBackupSettings";

export function RestoreBackup() {
  return (
    <div className="h-full flex flex-col bg-gray-50/50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <RestoreBackupHeader />
        <RestoreBackupSettings />
      </div>
    </div>
  );
}
