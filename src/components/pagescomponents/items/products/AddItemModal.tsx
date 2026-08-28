import { X, ScanBarcode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import { useSettings } from "@/hooks/useSettings";
import type {
  AddItemFormState,
  CategoryRecord,
  UnitRecord,
  Item,
} from "./types";

type AddItemModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemBeingEdited: Item | null;
  addItemForm: AddItemFormState;
  onFormChange: (field: keyof AddItemFormState, value: string) => void;
  addItemTab: "pricing" | "stock";
  onSetAddItemTab: (tab: "pricing" | "stock") => void;
  categoryList: CategoryRecord[];
  units: UnitRecord[];
  selectedUnit: UnitRecord | undefined;
  isSavingItem: boolean;
  addItemImageFileName: string;
  addItemImageDataUrl: string | null;
  addItemExistingImagePath: string | null;
  onImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenUnitSelector: () => void;
  onOpenAddCategory: () => void;
  onSaveItem: (closeAfterSave: boolean) => void;
};

export function AddItemModal({
  open,
  onOpenChange,
  itemBeingEdited,
  addItemForm,
  onFormChange,
  addItemTab,
  onSetAddItemTab,
  categoryList,
  selectedUnit,
  isSavingItem,
  addItemImageFileName,
  addItemImageDataUrl,
  addItemExistingImagePath,
  onImageSelection,
  onOpenUnitSelector,
  onOpenAddCategory,
  onSaveItem,
}: AddItemModalProps) {
  const [enableExpDate] = useSettings('enableExpDate', true);
  const [enableMfgDate] = useSettings('enableMfgDate', true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>{itemBeingEdited ? "Edit Item" : "Add Item"}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add item popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={addItemForm.itemName}
                onChange={(event) =>
                  onFormChange("itemName", event.target.value)
                }
                placeholder="Enter item name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={addItemForm.categoryId}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "add_new_category") {
                    onOpenAddCategory();
                  } else {
                    onFormChange("categoryId", value);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                <option
                  value="add_new_category"
                  className="text-[#E53935] font-medium"
                >
                  + Create New Category
                </option>
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={addItemForm.itemCode}
                  onChange={(event) =>
                    onFormChange("itemCode", event.target.value)
                  }
                  placeholder="Enter item code"
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                    onFormChange("itemCode", randomCode);
                  }}
                  className="absolute right-1 top-1 bottom-1 px-2 flex items-center justify-center text-white bg-[#E53935] hover:bg-[#d32f2f] rounded transition-colors"
                  aria-label="Assign Random Code"
                  title="Assign Random Code"
                >
                  <ScanBarcode className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <button
                onClick={onOpenUnitSelector}
                className="w-full border border-blue-300 text-blue-600 rounded-lg px-3 py-2 text-sm hover:bg-blue-50 text-left"
              >
                {selectedUnit
                  ? `${selectedUnit.fullName} (${selectedUnit.shortName})`
                  : "Select Unit"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageSelection}
              className="w-full cursor-pointer border border-gray-300 rounded-lg px-3 py-2 text-sm transition-colors hover:border-blue-400 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 file:transition-colors file:hover:bg-blue-100"
            />
            {addItemImageFileName ? (
              <p className="mt-1 text-xs text-gray-600">
                Selected: {addItemImageFileName}
              </p>
            ) : null}
            {!addItemImageFileName && addItemExistingImagePath ? (
              <p className="mt-1 text-xs text-gray-600">
                Current: {addItemExistingImagePath}
              </p>
            ) : null}
            {addItemImageDataUrl ? (
              <img
                src={addItemImageDataUrl}
                alt="Item preview"
                className="mt-2 h-20 w-20 rounded border border-gray-200 object-cover"
              />
            ) : null}
          </div>
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {(
              [
                { key: "pricing", label: "Pricing" },
                { key: "stock", label: "Stock" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => onSetAddItemTab(tab.key)}
                className={`pb-2 text-sm font-medium ${
                  addItemTab === tab.key
                    ? "text-[#E53935] border-b-2 border-[#E53935]"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {addItemTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    value={addItemForm.salePrice}
                    onChange={(event) =>
                      onFormChange("salePrice", event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Sale Price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wholesale Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    value={addItemForm.wholesalePrice}
                    onChange={(event) =>
                      onFormChange("wholesalePrice", event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Wholesale Price"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    value={addItemForm.purchasePrice}
                    onChange={(event) =>
                      onFormChange("purchasePrice", event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Purchase Price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Wholesale Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    placeholder="0"
                    value={addItemForm.minWholesaleQty}
                    onChange={(event) =>
                      onFormChange("minWholesaleQty", event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}

          {addItemTab === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Opening Stock
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    disabled={!!itemBeingEdited}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    value={addItemForm.openingStock}
                    onChange={(event) =>
                      onFormChange("openingStock", event.target.value)
                    }
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      itemBeingEdited ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    At Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={!!itemBeingEdited}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    value={addItemForm.atPrice}
                    onChange={(event) =>
                      onFormChange("atPrice", event.target.value)
                    }
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      itemBeingEdited ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As Of Date
                  </label>
                  <input
                    type="date"
                    disabled={!!itemBeingEdited}
                    placeholder="YYYY-MM-DD"
                    value={addItemForm.asOfDate}
                    onChange={(event) =>
                      onFormChange("asOfDate", event.target.value)
                    }
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm ${
                      itemBeingEdited ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === '+') e.preventDefault();
                    }}
                    placeholder="0"
                    value={addItemForm.lowStockThreshold}
                    onChange={(event) =>
                      onFormChange("lowStockThreshold", event.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              {(enableMfgDate || enableExpDate) && (
                <div className="grid grid-cols-2 gap-4">
                  {enableMfgDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturing Date (Optional)
                      </label>
                      <input
                        type="date"
                        placeholder="YYYY-MM-DD"
                        value={addItemForm.mfgDate}
                        onChange={(event) =>
                          onFormChange("mfgDate", event.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  {enableExpDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        placeholder="YYYY-MM-DD"
                        value={addItemForm.expDate}
                        onChange={(event) =>
                          onFormChange("expDate", event.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveItem(false)}
              disabled={
                Boolean(itemBeingEdited) ||
                isSavingItem ||
                !addItemForm.itemName.trim() ||
                !selectedUnit
              }
              className="px-4 py-2 bg-[#E53935] text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-60"
            >
              Save &amp; New
            </button>
            <button
              onClick={() => onSaveItem(true)}
              disabled={
                isSavingItem ||
                !addItemForm.itemName.trim() ||
                !selectedUnit
              }
              className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-60"
            >
              {isSavingItem
                ? "Saving..."
                : itemBeingEdited
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
