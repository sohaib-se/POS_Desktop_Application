import { X } from "lucide-react";
import type { ExpenseItem } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface ItemModalsProps {
  showAddItem: boolean;
  setShowAddItem: (show: boolean) => void;
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemPrice: string;
  setNewItemPrice: (price: string) => void;
  itemBeingEdited: ExpenseItem | null;
  setItemBeingEdited: (item: ExpenseItem | null) => void;
  handleCreateItem: () => void;

  itemPendingDelete: ExpenseItem | null;
  setItemPendingDelete: (item: ExpenseItem | null) => void;
  isDeletingItem: boolean;
  handleDeleteItem: (item: ExpenseItem) => void;
}

export function ItemModals({
  showAddItem,
  setShowAddItem,
  newItemName,
  setNewItemName,
  newItemPrice,
  setNewItemPrice,
  itemBeingEdited,
  setItemBeingEdited,
  handleCreateItem,
  itemPendingDelete,
  setItemPendingDelete,
  isDeletingItem,
  handleDeleteItem,
}: ItemModalsProps) {
  return (
    <>
      <Dialog
        open={showAddItem}
        onOpenChange={(isOpen: boolean) => {
          setShowAddItem(isOpen);
          if (!isOpen) {
            setNewItemName("");
            setNewItemPrice("");
            setItemBeingEdited(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {itemBeingEdited ? "Edit Item" : "Add Item"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddItem(false);
                  setNewItemName("");
                  setNewItemPrice("");
                  setItemBeingEdited(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add item popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Printer Paper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={newItemPrice}
                onChange={(event) => setNewItemPrice(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <button
              onClick={handleCreateItem}
              disabled={!newItemName.trim() || !newItemPrice}
              className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
            >
              {itemBeingEdited ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(itemPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingItem) {
            setItemPendingDelete(null);
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
                onClick={() => setItemPendingDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingItem || !itemPendingDelete}
                onClick={() => {
                  if (!itemPendingDelete) {
                    return;
                  }
                  void handleDeleteItem(itemPendingDelete);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingItem ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
