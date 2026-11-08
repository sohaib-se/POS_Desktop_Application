import { useTranslation } from "react-i18next";
import type { UnitRecord } from "@/components/pagescomponents/items/products/types";
import type { UnitContextMenuState } from "./types";

type Props = {
  unitContextMenu: UnitContextMenuState | null;
  getContextMenuStyle: (x: number, y: number) => React.CSSProperties;
  onEdit: (unit: UnitRecord) => void;
  onDelete: (unit: UnitRecord) => void;
  onClose: () => void;
};

export function UnitContextMenu({
  unitContextMenu,
  getContextMenuStyle,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const { t } = useTranslation();
  if (!unitContextMenu) return null;

  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
      style={getContextMenuStyle(unitContextMenu.x, unitContextMenu.y)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit(unitContextMenu.unit);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
      >
        {t("common.viewEdit")}
      </button>
      <button
        onClick={() => {
          onDelete(unitContextMenu.unit);
          onClose();
        }}
        className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
      >
        {t("common.delete")}
      </button>
    </div>
  );
}
