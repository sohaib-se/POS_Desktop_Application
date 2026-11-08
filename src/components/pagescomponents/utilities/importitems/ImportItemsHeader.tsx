import { useTranslation } from "react-i18next";

export function ImportItemsHeader() {
  const { t } = useTranslation();
  return (
    <h3 className="text-lg font-semibold text-gray-900 mb-6">
      {t("utilities.importItemsTitle")}
    </h3>
  );
}

