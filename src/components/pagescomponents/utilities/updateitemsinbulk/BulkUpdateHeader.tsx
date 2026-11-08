import { useTranslation } from "react-i18next";

export function BulkUpdateHeader() {
  const { t } = useTranslation();
  return (
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      {t("utilities.bulkUpdateTitle")}
    </h3>
  );
}

