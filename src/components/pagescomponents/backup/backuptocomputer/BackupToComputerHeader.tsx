import { useTranslation } from "react-i18next";

export function BackupToComputerHeader() {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {t("backup.backupToComputerTitle", "Backup to Computer")}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {t("backup.backupToComputerSubtitle", "Create a local backup file on this device.")}
      </p>
    </div>
  );
}
