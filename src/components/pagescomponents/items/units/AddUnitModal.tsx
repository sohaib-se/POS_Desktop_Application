import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import type { UnitRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  open: boolean;
  unitBeingEdited: UnitRecord | null;
  addUnitFullName: string;
  addUnitShortName: string;
  isSavingUnit: boolean;
  onSetAddUnitFullName: (name: string) => void;
  onSetAddUnitShortName: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function AddUnitModal({
  open,
  unitBeingEdited,
  addUnitFullName,
  addUnitShortName,
  isSavingUnit,
  onSetAddUnitFullName,
  onSetAddUnitShortName,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{unitBeingEdited ? t("items.editUnit") : t("items.addUnit")}</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close add unit popup"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("items.fullName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addUnitFullName}
              onChange={(event) => onSetAddUnitFullName(event.target.value)}
              placeholder="e.g. KILOGRAMS"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("items.shortName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addUnitShortName}
              onChange={(event) => onSetAddUnitShortName(event.target.value)}
              placeholder="e.g. Kg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={
                isSavingUnit ||
                !addUnitFullName.trim() ||
                !addUnitShortName.trim()
              }
              className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
            >
              {isSavingUnit
                ? t("common.saving")
                : unitBeingEdited
                  ? t("common.update")
                  : t("common.save")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
