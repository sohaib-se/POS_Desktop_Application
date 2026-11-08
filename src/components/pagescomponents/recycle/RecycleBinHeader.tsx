import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface RecycleBinHeaderProps {
  onEmptyTrash?: () => void;
}

export function RecycleBinHeader({ onEmptyTrash }: RecycleBinHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center p-4 bg-white mb-2">
      <h1 className="text-xl font-semibold text-gray-700">{t("utilities.recycleBinTitle")}</h1>
      <Button 
        variant="destructive" 
        className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-medium" 
        onClick={onEmptyTrash}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {t("utilities.emptyTrash")}
      </Button>
    </div>
  );
}
