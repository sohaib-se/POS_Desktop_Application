import type { ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import type { ConversionContextMenuState } from "./types";

type Props = {
  conversionContextMenu: ConversionContextMenuState | null;
  getContextMenuStyle: (x: number, y: number) => React.CSSProperties;
  onEdit: (conversion: ConversionRateRecord) => void;
  onDelete: (conversion: ConversionRateRecord) => void;
  onClose: () => void;
};

export function ConversionContextMenu({
  conversionContextMenu,
  getContextMenuStyle,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  if (!conversionContextMenu) return null;

  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
      style={getContextMenuStyle(conversionContextMenu.x, conversionContextMenu.y)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit(conversionContextMenu.conversion);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
      >
        Edit
      </button>
      <button
        onClick={() => {
          onDelete(conversionContextMenu.conversion);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
