import React from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardContent } from "./ui";
import type { Item, ItemContextMenuState } from "./types";

type ProductListProps = {
  filteredProductList: Item[];
  selectedItem: Item | null;
  isProductSearchActive: boolean;
  productSearchTerm: string;
  productSearchInputRef: React.RefObject<HTMLInputElement | null>;
  onSetSelectedItem: (item: Item) => void;
  onSetItemContextMenu: (state: ItemContextMenuState | null) => void;
  onSetIsProductSearchActive: (active: boolean) => void;
  onSetProductSearchTerm: (term: string) => void;
  onAddItem: () => void;
};

export function ProductList({
  filteredProductList,
  selectedItem,
  isProductSearchActive,
  productSearchTerm,
  productSearchInputRef,
  onSetSelectedItem,
  onSetItemContextMenu,
  onSetIsProductSearchActive,
  onSetProductSearchTerm,
  onAddItem,
}: ProductListProps) {
  return (
    <Card
      className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
      style={{ marginLeft: "4px" }}
    >
      <CardHeader className="p-2 pb-0 border-none flex flex-col gap-2">
        <div className="flex items-center justify-between mb-3">
          {isProductSearchActive ? (
            <div className="relative mr-3 flex-1 max-w-[220px]">
              <input
                ref={productSearchInputRef}
                type="text"
                value={productSearchTerm}
                onChange={(event) => onSetProductSearchTerm(event.target.value)}
                onBlur={() => {
                  onSetProductSearchTerm("");
                  onSetIsProductSearchActive(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    onSetProductSearchTerm("");
                    onSetIsProductSearchActive(false);
                  }
                }}
                placeholder="Search items"
                className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetIsProductSearchActive(true)}
              className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-5 py-2 shadow transition-all text-base relative"
          >
            <Plus className="w-5 h-5" />
            Add Item
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F9FB] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                ITEM
              </th>
              <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                QUANTITY
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProductList.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSetSelectedItem(item)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onSetSelectedItem(item);
                  onSetItemContextMenu({
                    item,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                className={`cursor-pointer border-b border-[#E3EAF2] ${
                  selectedItem?.id === item.id
                    ? "bg-[#E3F0FF] border-l-4 border-l-[#1976D2]"
                    : "hover:bg-[#F5F8FA]"
                }`}
              >
                <td className="px-4 py-3 text-[#222B45] font-medium">
                  {item.name}
                </td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    item.stockQuantity < 0
                      ? "text-[#E53935]"
                      : "text-[#43A047]"
                  }`}
                >
                  {Math.trunc(Number(item.stockQuantity || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
