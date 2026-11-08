import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import { useSettings } from "@/hooks/useSettings";
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
  const { t } = useTranslation();
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("items.stockDetails")}</DialogTitle>
        </DialogHeader>
        {selectedItem && (
          <div className="space-y-4 pt-2 pb-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {selectedItem.primaryUnit || selectedItem.unit || t("items.primaryUnit")}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {Math.floor(selectedItem.stockQuantity)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {selectedItem.secondaryUnit || t("items.secondaryUnit")}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.secondaryStock ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.conversionRate")}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.conversionRate
                  ? `1 ${
                      (selectedItem.primaryUnit || selectedItem.unit || t("common.unit")).includes("(")
                        ? (selectedItem.primaryUnit || selectedItem.unit || t("common.unit"))
                            .split("(")[1]
                            .replace(")", "")
                            .trim()
                        : selectedItem.primaryUnit || selectedItem.unit || t("common.unit")
                    } = ${selectedItem.conversionRate} ${
                      (selectedItem.secondaryUnit || t("items.secondaryUnit")).includes("(")
                        ? (selectedItem.secondaryUnit || t("items.secondaryUnit"))
                            .split("(")[1]
                            .replace(")", "")
                            .trim()
                        : selectedItem.secondaryUnit || t("items.secondaryUnit")
                    }`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.pricePerUnitSecondary", { unit: selectedItem.secondaryUnit || t("items.secondaryUnit") })}
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                {currencyStr}{" "}
                {selectedItem.conversionRate && selectedItem.conversionRate > 0
                  ? (selectedItem.salePrice / selectedItem.conversionRate).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.wholesalePrice")}
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                {currencyStr} {selectedItem.wholesalePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.wholesalePricePerUnit", { unit: selectedItem.secondaryUnit || t("items.secondaryUnit") })}
              </span>
              <span className="text-sm font-semibold text-[#43A047]">
                {currencyStr}{" "}
                {selectedItem.conversionRate && selectedItem.conversionRate > 0
                  ? (selectedItem.wholesalePrice / selectedItem.conversionRate).toFixed(2)
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.minWholesaleQty")}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.minStock ?? "-"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 pb-2">
              <span className="text-sm text-gray-500 font-medium">
                {t("items.lowStockThreshold")}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {selectedItem.lowStock ?? "-"}
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
            {t("common.close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
