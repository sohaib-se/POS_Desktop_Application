import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EstimatesHeaderProps {
  onAddEstimate: () => void;
}

export function EstimatesHeader({ onAddEstimate }: EstimatesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("estimates.title")}
        </h2>
      </div>
      <button
        onClick={onAddEstimate}
        className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("estimates.addEstimate")}
      </button>
    </div>
  );
}
