import type { ItemContextMenuState } from "./types";

type ItemContextMenuProps = {
  itemContextMenu: ItemContextMenuState;
  getContextMenuStyle: (x: number, y: number) => React.CSSProperties;
  onEdit: (menu: ItemContextMenuState) => void;
  onDelete: (menu: ItemContextMenuState) => void;
  onClose: () => void;
};

export function ItemContextMenu({
  itemContextMenu,
  getContextMenuStyle,
  onEdit,
  onDelete,
  onClose,
}: ItemContextMenuProps) {
  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
      style={getContextMenuStyle(itemContextMenu.x, itemContextMenu.y)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit(itemContextMenu);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
      >
        View/Edit
      </button>
      <button
        onClick={() => {
          onDelete(itemContextMenu);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
