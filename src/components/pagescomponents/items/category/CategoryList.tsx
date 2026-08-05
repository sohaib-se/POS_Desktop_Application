import { useRef } from "react";
import { Plus, Search } from "lucide-react";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import type { CategoryContextMenuState } from "./types";

type Props = {
  filteredCategoryList: CategoryRecord[];
  selectedCategoryId: string | null;
  isCategorySearchActive: boolean;
  categorySearchTerm: string;
  onSetSelectedCategoryId: (id: string | null) => void;
  onSetIsCategorySearchActive: (active: boolean) => void;
  onSetCategorySearchTerm: (term: string) => void;
  onOpenAddCategory: () => void;
  onSetCategoryContextMenu: (menu: CategoryContextMenuState | null) => void;
};

export function CategoryList({
  filteredCategoryList,
  selectedCategoryId,
  isCategorySearchActive,
  categorySearchTerm,
  onSetSelectedCategoryId,
  onSetIsCategorySearchActive,
  onSetCategorySearchTerm,
  onOpenAddCategory,
  onSetCategoryContextMenu,
}: Props) {
  const categorySearchInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden shadow-sm"
      style={{ marginLeft: "4px" }}
    >
      <div className="p-2 pb-0 border-none flex flex-col gap-2">
        <div className="flex items-center justify-between mb-3">
          {isCategorySearchActive ? (
            <div className="relative mr-3 flex-1 max-w-[220px]">
              <input
                ref={categorySearchInputRef}
                type="text"
                value={categorySearchTerm}
                onChange={(event) => onSetCategorySearchTerm(event.target.value)}
                onBlur={() => {
                  onSetCategorySearchTerm("");
                  onSetIsCategorySearchActive(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    onSetCategorySearchTerm("");
                    onSetIsCategorySearchActive(false);
                  }
                }}
                placeholder="Search categories"
                className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSetIsCategorySearchActive(true)}
              className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#4B5563] hover:bg-[#D1D5DB] transition-colors mr-3"
              aria-label="Search categories"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onOpenAddCategory}
            className="flex items-center gap-2 bg-[#FFA726] hover:bg-[#FB8C00] text-white font-semibold rounded-lg px-5 py-2 shadow transition-all text-base relative"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F9FB] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                CATEGORY
              </th>
              <th className="px-4 py-2 text-right font-semibold text-[#7B8A9A] text-xs tracking-wide align-middle">
                ITEM
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              onClick={() => onSetSelectedCategoryId(null)}
              className={`border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer ${
                selectedCategoryId === null ? "bg-[#E3F0FF]" : ""
              }`}
            >
              <td className="px-4 py-3 text-[#222B45] font-medium">
                Items not in any Category
              </td>
              <td className="px-4 py-3 text-right font-semibold text-[#7B8A9A]">
                0
              </td>
            </tr>
            {filteredCategoryList.map((cat) => (
              <tr
                key={cat.id}
                onClick={() => onSetSelectedCategoryId(cat.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onSetCategoryContextMenu({
                    category: cat,
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                className={`border-b border-[#E3EAF2] hover:bg-[#F5F8FA] cursor-pointer ${
                  selectedCategoryId === cat.id ? "bg-[#E3F0FF]" : ""
                }`}
              >
                <td className="px-4 py-3 text-[#222B45] font-medium">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#7B8A9A]">
                  {cat.itemCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
