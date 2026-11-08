import { useTranslation } from "react-i18next";

export function ImportPartiesHeader() {
  const { t } = useTranslation();
  return (
    <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
      {t("utilities.importPartiesTitle")}
    </h3>
  );
}

