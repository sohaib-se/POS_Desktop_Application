import { Search, X } from "lucide-react";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import type { ItemRecord } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  open: boolean;
  moveTargetCategoryName: string | null;
  categoryList: CategoryRecord[];
  moveItemsFilteredList: ItemRecord[];
  selectedMoveItemIds: string[];
  moveItemsFilterCategoryId: string;
  moveItemsSearchTerm: string;
  isMovingItems: boolean;
  onClose: () => void;
  onOpenChange: (isOpen: boolean) => void;
  onSetMoveItemsSearchTerm: (term: string) => void;
  onSetMoveItemsFilterCategoryId: (id: string) => void;
  onToggleMoveItemSelection: (itemId: string) => void;
  onConfirmMove: () => void;
};

export function MoveItemsDialog({
  open,
  moveTargetCategoryName,
  categoryList,
  moveItemsFilteredList,
  selectedMoveItemIds,
  moveItemsFilterCategoryId,
  moveItemsSearchTerm,
  isMovingItems,
  onClose,
  onOpenChange,
  onSetMoveItemsSearchTerm,
  onSetMoveItemsFilterCategoryId,
  onToggleMoveItemSelection,
  onConfirmMove,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Move Items To{" "}
              {moveTargetCategoryName ?? "Items Not In Any Category"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close move items popup"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search Items
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={moveItemsSearchTerm}
                  onChange={(event) =>
                    onSetMoveItemsSearchTerm(event.target.value)
                  }
                  placeholder="Search by item name, code, or category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm"
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AEB8C4]" />
              </div>
            </div>
            {/* Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Filter By Category
              </label>
              <select
                value={moveItemsFilterCategoryId}
                onChange={(event) =>
                  onSetMoveItemsFilterCategoryId(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Items</option>
                <option value="uncategorized">
                  Items not in any Category
                </option>
                {categoryList.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items table */}
          <div className="max-h-96 overflow-y-auto rounded-lg border border-[#E3EAF2]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#F7F9FB]">
                <tr>
                  <th className="w-12 px-4 py-3 text-left"></th>
                  <th className="px-4 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                    ITEM
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#7B8A9A] text-xs tracking-wide">
                    CURRENT CATEGORY
                  </th>
                </tr>
              </thead>
              <tbody>
                {moveItemsFilteredList.length ? (
                  moveItemsFilteredList.map((item) => {
                    const isSelected = selectedMoveItemIds.includes(item.id);
                    const isAlreadyInTargetCategory =
                      item.category === moveTargetCategoryName;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (!isAlreadyInTargetCategory)
                            onToggleMoveItemSelection(item.id);
                        }}
                        className={`border-b border-[#E3EAF2] ${
                          isAlreadyInTargetCategory
                            ? "bg-gray-50 text-gray-400"
                            : "cursor-pointer hover:bg-[#F5F8FA]"
                        } ${isSelected ? "bg-[#E3F0FF]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAlreadyInTargetCategory}
                            onChange={() =>
                              onToggleMoveItemSelection(item.id)
                            }
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-[#222B45]">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-[#4B5563]">
                          {item.category ?? "Items not in any Category"}
                        </td>
                      </tr>
                    );
                  })
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmMove}
              disabled={isMovingItems || !selectedMoveItemIds.length}
              className="px-4 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
            >
              {isMovingItems ? "Moving..." : "Move Selected Items"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
