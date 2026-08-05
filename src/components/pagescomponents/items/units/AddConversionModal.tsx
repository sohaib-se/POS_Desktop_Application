import { X } from "lucide-react";
import type { UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  open: boolean;
  units: UnitRecord[];
  conversionBaseUnit: string;
  conversionSecondaryUnit: string;
  conversionRateValue: number;
  conversionSaving: boolean;
  conversionError: string;
  conversionBeingEdited: ConversionRateRecord | null;
  onSetConversionBaseUnit: (unit: string) => void;
  onSetConversionSecondaryUnit: (unit: string) => void;
  onSetConversionRateValue: (rate: number) => void;
  onClose: () => void;
  onSave: () => void;
};

export function AddConversionModal({
  open,
  units,
  conversionBaseUnit,
  conversionSecondaryUnit,
  conversionRateValue,
  conversionSaving,
  conversionError,
  conversionBeingEdited,
  onSetConversionBaseUnit,
  onSetConversionSecondaryUnit,
  onSetConversionRateValue,
  onClose,
  onSave,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{conversionBeingEdited ? "Edit Conversion" : "Add Conversion"}</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close add conversion popup"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Unit
              </label>
              <select
                value={conversionBaseUnit}
                onChange={(event) => onSetConversionBaseUnit(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.shortName}>
                    {unit.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Unit
              </label>
              <select
                value={conversionSecondaryUnit}
                onChange={(event) =>
                  onSetConversionSecondaryUnit(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.shortName}>
                    {unit.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              1 {conversionBaseUnit || "BASE UNIT"} =
            </span>
            <input
              type="number"
              min={0}
              value={conversionRateValue}
              onChange={(event) =>
                onSetConversionRateValue(Number(event.target.value) || 0)
              }
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-sm text-gray-600">
              {conversionSecondaryUnit || "SECONDARY UNIT"}
            </span>
          </div>
          {conversionError ? (
            <p className="text-sm text-red-600">{conversionError}</p>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={conversionSaving}
            className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1251A3] disabled:opacity-60"
          >
            {conversionSaving ? "Saving..." : "SAVE"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
