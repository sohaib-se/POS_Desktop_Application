import { X } from "lucide-react";
import type { UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";


type Props = {
  open: boolean;
  units: UnitRecord[];
  conversionRates: ConversionRateRecord[];
  unitSelectorBaseUnitId: string;
  unitSelectorSecondaryUnitId: string;
  unitSelectorConversionRate: number;
  onSetUnitSelectorBaseUnitId: (id: string) => void;
  onSetUnitSelectorSecondaryUnitId: (id: string) => void;
  onSetUnitSelectorConversionRate: (rate: number) => void;
  onClose: () => void;
  onSave: () => void;
};

export function UnitSelectorModal({
  open,
  units,
  conversionRates,
  unitSelectorBaseUnitId,
  unitSelectorSecondaryUnitId,
  unitSelectorConversionRate,
  onSetUnitSelectorBaseUnitId,
  onSetUnitSelectorSecondaryUnitId,
  onSetUnitSelectorConversionRate,
  onClose,
  onSave,
}: Props) {
  const baseUnit = units.find((u) => u.id === unitSelectorBaseUnitId);
  const baseConversions = baseUnit
    ? conversionRates.filter((c) => c.base_unit === baseUnit.shortName)
    : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Select Unit</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close unit selector popup"
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
                value={unitSelectorBaseUnitId}
                onChange={(event) =>
                  onSetUnitSelectorBaseUnitId(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.shortName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Unit
              </label>
              <select
                value={unitSelectorSecondaryUnitId}
                onChange={(event) =>
                  onSetUnitSelectorSecondaryUnitId(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {baseUnit && baseConversions.length > 0 && (
            <div className="mt-2 pt-3 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Conversions for {baseUnit.fullName}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {baseConversions.map((conv) => {
                  const secUnit = units.find(
                    (u) => u.shortName === conv.secondary_unit
                  );
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        if (secUnit)
                          onSetUnitSelectorSecondaryUnitId(secUnit.id);
                        onSetUnitSelectorConversionRate(conv.conversion_rate);
                      }}
                      className="flex flex-col items-start p-2 border border-gray-200 rounded-lg hover:border-[#1976D2] hover:bg-blue-50 transition-colors text-left"
                    >
                      <span className="text-sm font-semibold text-gray-800">
                        1 {baseUnit.shortName} = {conv.conversion_rate}{" "}
                        {secUnit?.shortName || conv.secondary_unit}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        Click to select
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">
              1{" "}
              {baseUnit?.fullName ?? "BASE UNIT"}{" "}
              =
            </span>
            <input
              type="number"
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="0"
              value={unitSelectorConversionRate}
              onChange={(event) =>
                onSetUnitSelectorConversionRate(
                  Number(event.target.value) || 0
                )
              }
            />
            <span className="text-sm text-gray-600">
              {units.find((u) => u.id === unitSelectorSecondaryUnitId)
                ? `${units.find((u) => u.id === unitSelectorSecondaryUnitId)!.fullName} (${units.find((u) => u.id === unitSelectorSecondaryUnitId)!.shortName})`
                : "SECONDARY UNIT"}
            </span>
          </div>
          <button
            onClick={onSave}
            className="w-full bg-[#1976D2] text-white py-2 rounded-lg text-sm font-medium"
          >
            SAVE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
