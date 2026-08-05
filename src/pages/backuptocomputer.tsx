import { BackupToComputerHeader } from "@/components/pagescomponents/backup/backuptocomputer/BackupToComputerHeader";
import { BackupToComputerSettings } from "@/components/pagescomponents/backup/backuptocomputer/BackupToComputerSettings";

export function BackupToComputer() {
  return (
    <div className="h-full flex flex-col bg-white p-6">
      <div className="max-w-3xl">
        <BackupToComputerHeader />
        <BackupToComputerSettings />
      </div>
    </div>
  );
}
