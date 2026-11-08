import { useTranslation } from "react-i18next";

export function RestoreBackupHeader() {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        {t("backup.restoreBackupTitle", "Restore Backup")}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {t("backup.restoreBackupSubtitle", "Restore data from a previous backup file.")}
      </p>
    </div>
  );
}
