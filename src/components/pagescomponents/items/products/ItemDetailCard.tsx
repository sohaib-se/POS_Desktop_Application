import { SlidersHorizontal } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { Card } from "./ui";
import type { Item } from "./types";

type ItemDetailCardProps = {
  selectedItem: Item;
  onStockDetails: () => void;
  onAdjustItem: (item: Item) => void;
};

export function ItemDetailCard({
  selectedItem,
  onStockDetails,
  onAdjustItem,
}: ItemDetailCardProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  return (
    <Card
      className="bg-white rounded-md shadow-sm px-0 py-0"
      style={{
        minHeight: "96px",
        marginBottom: "4px",
      }}
    >
      <div className="flex w-full h-full items-start justify-between">
        {/* Left: Name and prices */}
        <div className="flex flex-col justify-start pl-6 pt-5 pb-2 min-w-[220px]">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
              {selectedItem.name}
            </h2>
            <span className="inline-block align-middle text-[#151B26] cursor-pointer">
              <svg width="18" height="18" fill="none">
                <path
                  d="M7.5 10.5L15 3M15 3H9M15 3V9"
                  stroke="#151B26"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#151B26]">
              SALE PRICE:{" "}
              <span className="text-[#43A047]">
                {currencyStr} {selectedItem.salePrice.toFixed(2)}
              </span>
            </span>
            <span className="text-sm font-medium text-[#151B26]">
              PURCHASE PRICE:{" "}
              <span className="text-[#43A047]">
                {currencyStr} {selectedItem.purchasePrice.toFixed(2)}
              </span>
            </span>
          </div>
        </div>
        {/* Right: Buttons and stock stats */}
        <div className="flex flex-col items-end justify-between flex-1 pr-6 pt-5 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onStockDetails}
              className="bg-[#F0F4F8] hover:bg-[#E3EAF2] text-[#1976D2] px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-sm transition-all border border-[#1976D2]"
            >
              Stock Details
            </button>
            <button
              onClick={() => onAdjustItem(selectedItem)}
              className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow transition-all"
              style={{ minWidth: "140px" }}
            >
              <SlidersHorizontal className="w-5 h-5" />
              ADJUST ITEM
            </button>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="text-sm font-medium text-[#151B26] flex items-center gap-2">
              STOCK QUANTITY:{" "}
              <span className="text-[#43A047]">
                {Math.floor(selectedItem.stockQuantity)}
              </span>
            </span>
            <span className="text-sm font-medium text-[#151B26]">
              STOCK VALUE:{" "}
              <span className="text-[#43A047]">
                {currencyStr} {selectedItem.stockValue?.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
