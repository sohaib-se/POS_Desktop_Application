import { useTranslation } from "react-i18next";

export function EditProfileHeader() {
  const { t } = useTranslation();
  return (
    <div className="p-6 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-900">{t("profile.editProfileTitle")}</h1>
    </div>
  );
}
