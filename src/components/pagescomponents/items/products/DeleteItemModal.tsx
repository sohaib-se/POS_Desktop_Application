import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import type { Item } from "./types";

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
          <DialogTitle>Delete Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {itemPendingDelete
              ? `Are you sure you want to delete ${itemPendingDelete.name}? This action cannot be undone.`
              : "Are you sure you want to delete this item?"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingItem}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
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
              {isDeletingItem ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
