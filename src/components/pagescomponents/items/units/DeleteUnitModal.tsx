import { useTranslation } from "react-i18next";
import type { UnitRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  unitPendingDelete: UnitRecord | null;
  isDeletingUnit: boolean;
  onCancel: () => void;
  onConfirm: (unit: UnitRecord) => void;
};

export function DeleteUnitModal({
  unitPendingDelete,
  isDeletingUnit,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={Boolean(unitPendingDelete)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeletingUnit) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("items.deleteUnitTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {unitPendingDelete
              ? t("items.deleteUnitConfirm", { name: unitPendingDelete.fullName })
              : t("items.deleteUnitGeneric")}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingUnit}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeletingUnit || !unitPendingDelete}
              onClick={() => {
                if (!unitPendingDelete) return;
                onConfirm(unitPendingDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingUnit ? t("common.saving") : t("common.delete")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
