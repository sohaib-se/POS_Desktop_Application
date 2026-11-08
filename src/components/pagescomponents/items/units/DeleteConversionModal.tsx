import { useTranslation } from "react-i18next";
import type { ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  conversionPendingDelete: ConversionRateRecord | null;
  isDeletingConversion: boolean;
  onCancel: () => void;
  onConfirm: (conversion: ConversionRateRecord) => void;
};

export function DeleteConversionModal({
  conversionPendingDelete,
  isDeletingConversion,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={Boolean(conversionPendingDelete)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeletingConversion) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("items.deleteConversionTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t("items.deleteConversionMsg")}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingConversion}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeletingConversion || !conversionPendingDelete}
              onClick={() => {
                if (!conversionPendingDelete) return;
                onConfirm(conversionPendingDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingConversion ? t("common.saving") : t("common.delete")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
