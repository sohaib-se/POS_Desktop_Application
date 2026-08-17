import { X, ChevronDown } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import type { PosRow } from "./types";

interface ModalsProps {
  activeModal:
    | "quantity"
    | "unit"
    | "discount"
    | "description"
    | "no_selection"
    | null;
  setActiveModal: (
    modal: "quantity" | "unit" | "discount" | "description" | "no_selection" | null
  ) => void;
  selectedRow?: PosRow;
  modalQuantity: string;
  setModalQuantity: (val: string) => void;
  modalUnit: string;
  setModalUnit: (val: string) => void;
  subTotalAmount: number;
  modalDiscountPercent: string;
  modalDiscountAmount: string;
  handleDiscountPercentChange: (val: string) => void;
  handleDiscountAmountChange: (val: string) => void;
  modalDescription: string;
  setModalDescription: (val: string) => void;
  saveModal: () => void;
}

export function Modals({
  activeModal,
  setActiveModal,
  selectedRow,
  modalQuantity,
  setModalQuantity,
  modalUnit,
  setModalUnit,
  subTotalAmount,
  modalDiscountPercent,
  modalDiscountAmount,
  handleDiscountPercentChange,
  handleDiscountAmountChange,
  modalDescription,
  setModalDescription,
  saveModal,
}: ModalsProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  if (activeModal === null) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/30 flex items-center justify-center z-[100] backdrop-blur-[1px]">
      <div
        className="bg-white rounded-md shadow-xl w-[320px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            {activeModal === "quantity" && "Change Quantity"}
            {activeModal === "unit" && "Change Unit"}
            {activeModal === "discount" && "Bill Discount"}
            {activeModal === "description" && "Description"}
            {activeModal === "no_selection" && "No Items Added"}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveModal(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400">[Esc]</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          {(activeModal === "quantity" || activeModal === "unit") &&
            selectedRow && (
              <div className="text-sm">
                <span className="text-gray-600">Item Name: </span>
                <span className="font-bold text-gray-900">
                  {selectedRow.itemName}
                </span>
              </div>
            )}

          {activeModal === "quantity" && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">
                Enter New Quantity
              </label>
              <input
                type="text"
                autoFocus
                value={modalQuantity}
                onChange={(e) => setModalQuantity(e.target.value)}
                className="w-full border border-blue-400 rounded px-3 py-1.5 text-sm text-gray-800 outline-none ring-1 ring-blue-400/20"
              />
              <button className="text-xs text-blue-500 font-medium hover:text-blue-600 mt-2">
                Connect Weighing Scale {">"}
              </button>
            </div>
          )}

          {activeModal === "unit" && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Select Unit</label>
              <div className="relative">
                <select
                  value={modalUnit}
                  onChange={(e) => setModalUnit(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-400"
                >
                  <option value="Btl">BOTTLES (Btl)</option>
                  <option value="Box">BOXES (Box)</option>
                  <option value="Pc">PIECES (Pc)</option>
                  <option value="Kg">KILOGRAMS (Kg)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
              </div>
            </div>
          )}

          {activeModal === "discount" && (
            <>
              <div className="text-sm">
                <span className="text-gray-600">Total: </span>
                <span className="font-bold text-gray-900">
                  {currencyStr} {subTotalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-gray-500">Discount in %</label>
                  <div className="flex items-center border border-blue-400 rounded px-2 py-1.5 ring-1 ring-blue-400/20">
                    <span className="text-blue-500 text-xs mr-1">%</span>
                    <input
                      type="text"
                      autoFocus
                      value={modalDiscountPercent}
                      onChange={(e) =>
                        handleDiscountPercentChange(e.target.value)
                      }
                      className="w-full text-sm text-gray-800 outline-none"
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400 mt-5">
                  OR
                </span>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-gray-500">Discount in Rs</label>
                  <div className="flex items-center border border-gray-300 rounded px-2 py-1.5 focus-within:border-blue-400">
                    <span className="text-gray-500 text-xs mr-1">Rs</span>
                    <input
                      type="text"
                      value={modalDiscountAmount}
                      onChange={(e) =>
                        handleDiscountAmountChange(e.target.value)
                      }
                      className="w-full text-sm text-gray-800 outline-none text-right"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeModal === "description" && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                autoFocus
                rows={3}
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm text-gray-800 outline-none ring-1 ring-blue-400/20 resize-none"
              />
            </div>
          )}

          {activeModal === "no_selection" && (
            <div className="text-sm text-gray-700 py-2">
              <p>Please add at-least one item to perform this action.</p>
            </div>
          )}

          {/* Modal Actions */}
          {activeModal === "no_selection" ? (
            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#a7f3d0] hover:bg-[#86efac] text-[#065f46] font-medium py-1.5 rounded text-sm transition-colors border border-[#a7f3d0]"
              >
                Okay
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <button
                onClick={saveModal}
                className="flex-1 bg-[#a7f3d0] hover:bg-[#86efac] text-[#065f46] font-medium py-1.5 rounded text-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-600 font-medium py-1.5 rounded border border-gray-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
