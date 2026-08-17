import type React from "react";
import { useSettings } from "@/hooks/useSettings";
import { Search } from "lucide-react";
import type { PosTab, ItemOption } from "./types";

interface SearchInputProps {
  activeTab: PosTab;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  filteredItems: ItemOption[];
  searchFocused: boolean;
  searchSelectedIndex: number;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setSearchFocused: (focused: boolean) => void;
  setSearchSelectedIndex: (index: number) => void;
  handleSelectItem: (item: ItemOption) => void;
}

export function SearchInput({
  activeTab,
  searchInputRef,
  filteredItems,
  searchFocused,
  searchSelectedIndex,
  handleSearchChange,
  handleSearchKeyDown,
  setSearchFocused,
  setSearchSelectedIndex,
  handleSelectItem,
}: SearchInputProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  return (
    <div className="p-2 border-b border-gray-200">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={activeTab.searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => setSearchFocused(true)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Scan or search by item code, model no or item name"
          className="w-full rounded border border-blue-400 pl-3 pr-10 py-2 text-sm text-gray-700 outline-none ring-1 ring-blue-400/20"
          autoFocus
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />

        {searchFocused &&
          activeTab.searchQuery &&
          filteredItems.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectItem(item);
                  }}
                  onMouseEnter={() => setSearchSelectedIndex(index)}
                  className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm ${
                    index === searchSelectedIndex
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.code && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({item.code})
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {currencyStr} {item.sale_price}
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
