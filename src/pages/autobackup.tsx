import { AutoBackupHeader } from "@/components/pagescomponents/backup/autobackup/AutoBackupHeader";
import { AutoBackupSettings } from "@/components/pagescomponents/backup/autobackup/AutoBackupSettings";

export function AutoBackup() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="max-w-3xl">
        <AutoBackupHeader />
        <AutoBackupSettings />
      </div>
    </div>
  );
}
