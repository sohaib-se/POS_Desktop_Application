import { AutoBackupHeader } from "@/components/pagescomponents/backup/autobackup/AutoBackupHeader";
import { AutoBackupSettings } from "@/components/pagescomponents/backup/autobackup/AutoBackupSettings";

export function AutoBackup() {
  return (
    <div className="h-full flex flex-col bg-gray-50/50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <AutoBackupHeader />
        <AutoBackupSettings />
      </div>
    </div>
  );
}
