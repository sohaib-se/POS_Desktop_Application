import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import type { ItemRecord } from "./types";
import { Card, CardContent } from "./ui";

type Props = {
  selectedCategory: CategoryRecord | undefined;
  filteredCategoryItems: ItemRecord[];
  categoryItemSearchTerm: string;
  onSetCategoryItemSearchTerm: (term: string) => void;
  onOpenMoveItemsDialog: () => void;
};

export function CategoryDetailsPanel({
  selectedCategory,
  filteredCategoryItems,
  categoryItemSearchTerm,
  onSetCategoryItemSearchTerm,
  onOpenMoveItemsDialog,
}: Props) {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const placeholders = ["Item Name", "Quantity", "Amount"];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSearchInput &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !categoryItemSearchTerm
      ) {
        setShowSearchInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchInput, categoryItemSearchTerm]);

  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  return (
    <div className="flex-1 flex flex-col" style={{ marginRight: "4px" }}>
      {/* Header card */}
      <Card
        className="bg-white rounded-md shadow-sm px-0 py-0"
        style={{ minHeight: "72px", marginBottom: "4px" }}
      >
        <div className="flex w-full h-full items-start justify-between">
          <div className="flex flex-col justify-start pl-6 pt-5 pb-2 min-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-bold text-[#151B26] tracking-wide uppercase">
                {selectedCategory?.name ?? "ITEMS NOT IN ANY CATEGORY"}
              </h2>
            </div>
            <span className="text-sm font-medium text-[#151B26]">
              {filteredCategoryItems.length}
            </span>
          </div>
          <div className="flex flex-col items-end justify-between flex-1 pr-6 pt-5 pb-2">
            <button
              onClick={onOpenMoveItemsDialog}
              className="bg-[#1976D2] hover:bg-[#1251A3] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow transition-all mb-2"
              style={{ minWidth: "140px" }}
            >
              Move To This Category
            </button>
          </div>
        </div>
      </Card>

      {/* Items table card */}
      <Card className="bg-white rounded-md flex flex-col flex-1 overflow-hidden shadow-sm p-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <h3 className="text-base font-bold text-[#222B45] tracking-wide">
              ITEMS
            </h3>
            <div className="flex gap-2 items-center h-10" ref={searchContainerRef}>
              <div 
                className={`flex items-center overflow-hidden transition-all duration-300 ease-out rounded-full h-9 ${
                  showSearchInput 
                    ? "w-64 bg-white border border-blue-500 ring-4 ring-blue-50" 
                    : "w-9 bg-transparent border border-transparent hover:bg-gray-100 cursor-pointer"
                }`}
                onClick={(e) => {
                  if (!showSearchInput) {
                    e.stopPropagation();
                    setShowSearchInput(true);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }
                }}
              >
                <div className="flex items-center justify-center h-full w-9 shrink-0">
                  <Search className={`w-4 h-4 ${showSearchInput ? "text-gray-400" : "text-gray-500"}`} />
                </div>
                <div className={`relative flex-1 h-full flex items-center transition-opacity duration-200 ${
                    showSearchInput ? "opacity-100 delay-100" : "opacity-0"
                  }`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={categoryItemSearchTerm}
                    onChange={(e) => onSetCategoryItemSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 focus:outline-none focus:border-transparent text-sm h-full w-full pr-3 relative z-10"
                  />
                  {!categoryItemSearchTerm && (
                    <div className="absolute left-0 pointer-events-none flex items-center h-full w-full overflow-hidden text-gray-400 text-sm">
                      <span className="whitespace-pre">Search </span>
                      <div className="relative h-full flex-1 overflow-hidden">
                        {placeholders.map((ph, idx) => (
                          <span
                            key={ph}
                            className={`absolute top-0 left-0 flex items-center h-full transition-all duration-700 ease-in-out ${
                              idx === placeholderIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                            }`}
                          >
                            {ph}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E3EAF2] rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9FB] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                    NAME{" "}
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                    QUANTITY{" "}
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                    STOCK VALUE{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCategoryItems.length ? (
                  filteredCategoryItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E3EAF2] hover:bg-[#F5F8FA]"
                    >
                      <td className="px-4 py-3 text-[#222B45] font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                        {item.stockQuantity ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#43A047]">
                        {item.stockValue != null ? `${currencyStr} ${item.stockValue.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-sm text-[#7B8A9A]"
                    >
                      There are no items to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
