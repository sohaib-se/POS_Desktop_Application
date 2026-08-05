import { X } from "lucide-react";
import { Dialog, DialogContent } from "./ui";
import type { Item, AdjustStockForm } from "./types";

type AdjustStockModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: Item | null;
  adjustStockForm: AdjustStockForm;
  onFormChange: (updates: Partial<AdjustStockForm>) => void;
  isSavingAdjustment: boolean;
  onSave: () => void;
};

export function AdjustStockModal({
  open,
  onOpenChange,
  selectedItem,
  adjustStockForm,
  onFormChange,
  isSavingAdjustment,
  onSave,
}: AdjustStockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[900px] !max-w-[900px] p-6 bg-white rounded-lg shadow-2xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-8">
            <h2 className="text-[20px] font-semibold text-[#1A202C]">
              Stock Adjustment
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${adjustStockForm.type === "Add" ? "text-[#1976D2]" : "text-gray-400"}`}
              >
                Add Stock
              </span>
              <button
                onClick={() =>
                  onFormChange({
                    type: adjustStockForm.type === "Add" ? "Reduce" : "Add",
                  })
                }
                className="relative inline-flex h-[22px] w-11 items-center rounded-full bg-[#1976D2] transition-colors focus:outline-none"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    adjustStockForm.type === "Add"
                      ? "translate-x-[4px]"
                      : "translate-x-[24px]"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-400">
                Reduce Stock
              </span>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Info Section */}
        <div className="flex justify-between items-end pb-4 border-b border-[#E5E7EB] mb-6">
          <div>
            <p className="text-[13px] text-gray-500 mb-1 font-medium">
              Item Name
            </p>
            <p className="text-[14px] font-bold text-[#1A202C]">
              {selectedItem?.name}
            </p>
          </div>
          <div>
            <div className="relative border border-[#D1D5DB] rounded-[4px] px-3 py-[6px] flex items-center bg-white w-[200px]">
              <span className="text-[11px] text-gray-500 absolute -top-[8px] left-3 bg-white px-1 leading-none">
                Adjustment Date
              </span>
              <input
                type="date"
                value={adjustStockForm.date}
                onChange={(e) => onFormChange({ date: e.target.value })}
                className="w-full text-[14px] outline-none text-[#4B5563] bg-transparent font-medium"
              />
            </div>
          </div>
        </div>

        {/* Form Row */}
        <div className="flex gap-4 mb-8 items-center">
          <div className="w-[180px]">
            <input
              type="number"
              placeholder="Total Qty"
              value={adjustStockForm.qty}
              onChange={(e) => onFormChange({ qty: e.target.value })}
              className="w-full border border-[#D1D5DB] rounded-[4px] px-3 py-[8px] text-[14px] outline-none placeholder:text-[#9CA3AF] text-[#1A202C]"
            />
          </div>
          <div className="w-[80px]">
            <select
              value={adjustStockForm.unit}
              onChange={(e) => onFormChange({ unit: e.target.value })}
              className="w-full text-[14px] outline-none bg-transparent text-[#4B5563] font-medium cursor-pointer"
            >
              {selectedItem?.primaryUnit || selectedItem?.unit ? (
                <option
                  value={
                    (selectedItem?.primaryUnit || selectedItem?.unit) ?? ""
                  }
                >
                  {selectedItem?.primaryUnit || selectedItem?.unit}
                </option>
              ) : null}
              {selectedItem?.secondaryUnit && (
                <option value={selectedItem.secondaryUnit ?? ""}>
                  {selectedItem.secondaryUnit}
                </option>
              )}
            </select>
          </div>
          <div className="w-[200px]">
            <input
              type="number"
              placeholder="At Price"
              value={adjustStockForm.atPrice}
              onChange={(e) => onFormChange({ atPrice: e.target.value })}
              className="w-full border border-[#D1D5DB] rounded-[4px] px-3 py-[8px] text-[14px] outline-none placeholder:text-[#9CA3AF] text-[#1A202C]"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Details"
              value={adjustStockForm.details}
              onChange={(e) => onFormChange({ details: e.target.value })}
              className="w-full border border-[#D1D5DB] rounded-[4px] px-3 py-[8px] text-[14px] outline-none placeholder:text-[#9CA3AF] text-[#1A202C]"
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onSave}
            disabled={isSavingAdjustment || !adjustStockForm.qty}
            className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-8 py-[8px] rounded-[4px] font-semibold text-[14px] transition-colors disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
