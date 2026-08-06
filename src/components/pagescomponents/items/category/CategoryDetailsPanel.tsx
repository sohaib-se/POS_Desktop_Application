import { Search } from "lucide-react";
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
            <div className="flex gap-2 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={categoryItemSearchTerm}
                  onChange={(e) => onSetCategoryItemSearchTerm(e.target.value)}
                  className="bg-[#F7F9FB] border border-[#E3EAF2] rounded-lg px-8 py-1.5 text-sm text-[#222B45] focus:bg-white focus:border-[#1976D2]"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEB8C4]" />
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
                        {item.stockValue != null ? `Rs ${item.stockValue.toFixed(2)}` : "—"}
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
