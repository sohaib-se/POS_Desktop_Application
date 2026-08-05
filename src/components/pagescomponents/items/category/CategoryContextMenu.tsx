import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import type { CategoryContextMenuState } from "./types";

type Props = {
  categoryContextMenu: CategoryContextMenuState | null;
  getContextMenuStyle: (x: number, y: number) => React.CSSProperties;
  onEdit: (category: CategoryRecord) => void;
  onDelete: (category: CategoryRecord) => void;
  onClose: () => void;
};

export function CategoryContextMenu({
  categoryContextMenu,
  getContextMenuStyle,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  if (!categoryContextMenu) return null;

  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
      style={getContextMenuStyle(categoryContextMenu.x, categoryContextMenu.y)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit(categoryContextMenu.category);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
      >
        View/Edit
      </button>
      <button
        onClick={() => {
          onDelete(categoryContextMenu.category);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
