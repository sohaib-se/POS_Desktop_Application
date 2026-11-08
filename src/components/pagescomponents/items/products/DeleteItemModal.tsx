import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import type { Item } from "./types";
import { useTranslation } from "react-i18next";

type DeleteItemModalProps = {
  itemPendingDelete: Item | null;
  isDeletingItem: boolean;
  onCancel: () => void;
  onConfirm: (item: Item) => void;
};

export function DeleteItemModal({
  itemPendingDelete,
  isDeletingItem,
  onCancel,
  onConfirm,
}: DeleteItemModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={Boolean(itemPendingDelete)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeletingItem) {
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("items.deleteItem")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {itemPendingDelete
              ? t("items.deleteItemConfirm", { name: itemPendingDelete.name })
              : t("items.deleteItemGeneric")}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingItem}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeletingItem || !itemPendingDelete}
              onClick={() => {
                if (!itemPendingDelete) return;
                onConfirm(itemPendingDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingItem ? t("parties.deleting") : t("common.delete")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
