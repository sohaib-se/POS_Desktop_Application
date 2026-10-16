import { BackupToComputerHeader } from "@/components/pagescomponents/backup/backuptocomputer/BackupToComputerHeader";
import { BackupToComputerSettings } from "@/components/pagescomponents/backup/backuptocomputer/BackupToComputerSettings";

export function BackupToComputer() {
  return (
    <div className="h-full flex flex-col bg-gray-50/50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <BackupToComputerHeader />
        <BackupToComputerSettings />
      </div>
    </div>
  );
}
