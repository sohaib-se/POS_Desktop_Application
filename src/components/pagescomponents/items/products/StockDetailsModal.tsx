import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import type { Item } from "./types";

type StockDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  selectedItem: Item | null;
};

export function StockDetailsModal({
  open,
  onClose,
  selectedItem,
}: StockDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Stock Details</DialogTitle>
        </DialogHeader>
        {selectedItem && (
          <div className="space-y-4 pt-2 pb-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {selectedItem.primaryUnit || selectedItem.unit || "Primary Unit"}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {Math.floor(selectedItem.stockQuantity)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {selectedItem.secondaryUnit || "Secondary Unit"}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.secondaryStock ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                Conversion Rate
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.conversionRate
                  ? `1 ${
                      (selectedItem.primaryUnit || selectedItem.unit || "Unit").includes("(")
                        ? (selectedItem.primaryUnit || selectedItem.unit || "Unit")
                            .split("(")[1]
                            .replace(")", "")
                            .trim()
                        : selectedItem.primaryUnit || selectedItem.unit || "Unit"
                    } = ${selectedItem.conversionRate} ${
                      (selectedItem.secondaryUnit || "Secondary Unit").includes("(")
                        ? (selectedItem.secondaryUnit || "Secondary Unit")
                            .split("(")[1]
                            .replace(")", "")
                            .trim()
                        : selectedItem.secondaryUnit || "Secondary Unit"
                    }`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-gray-500 font-medium">
                Price Per {selectedItem.secondaryUnit || "Secondary Unit"}
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                Rs{" "}
                {selectedItem.conversionRate && selectedItem.conversionRate > 0
                  ? (selectedItem.salePrice / selectedItem.conversionRate).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                Wholesale Price
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                Rs {selectedItem.wholesalePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                Wholesale Price Per{" "}
                {selectedItem.secondaryUnit || "Secondary Unit"}
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                Rs{" "}
                {selectedItem.conversionRate && selectedItem.conversionRate > 0
                  ? (selectedItem.wholesalePrice / selectedItem.conversionRate).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                Min Wholesale Qty
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.minStock ?? "-"}
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
