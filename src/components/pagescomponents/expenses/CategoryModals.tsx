import { X, AlertTriangle } from "lucide-react";
import type { ExpenseCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import type { ExpenseRecord } from "./types";

interface CategoryModalsProps {
  showAddCategory: boolean;
  setShowAddCategory: (show: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  categoryBeingEdited: ExpenseCategory | null;
  setCategoryBeingEdited: (cat: ExpenseCategory | null) => void;
  handleCreateCategory: () => void;

  categoryPendingDelete: ExpenseCategory | null;
  setCategoryPendingDelete: (cat: ExpenseCategory | null) => void;
  isDeletingCategory: boolean;
  handleDeleteCategory: (cat: ExpenseCategory) => void;
  expenseRecordList: ExpenseRecord[];
}

export function CategoryModals({
  showAddCategory,
  setShowAddCategory,
  newCategoryName,
  setNewCategoryName,
  categoryBeingEdited,
  setCategoryBeingEdited,
  handleCreateCategory,
  categoryPendingDelete,
  setCategoryPendingDelete,
  isDeletingCategory,
  handleDeleteCategory,
  expenseRecordList,
}: CategoryModalsProps) {
  const linkedTransactionCount = categoryPendingDelete
    ? expenseRecordList.filter(
        (r) => r.category_id === categoryPendingDelete.id && Number(r.amount) > 0
      ).length
    : 0;
  const hasLinkedTransactions = linkedTransactionCount > 0;
  return (
    <>
      <Dialog
        open={showAddCategory}
        onOpenChange={(isOpen: boolean) => {
          setShowAddCategory(isOpen);
          if (!isOpen) {
            setNewCategoryName("");
            setCategoryBeingEdited(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {categoryBeingEdited ? "Edit Category" : "Add Category"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                  setCategoryBeingEdited(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close add category popup"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Grocery"
              />
            </div>
            <button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
              className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
            >
              {categoryBeingEdited ? "Update" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryPendingDelete)}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen && !isDeletingCategory) {
            setCategoryPendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {hasLinkedTransactions ? (
              <>
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Cannot delete — transactions exist
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      <span className="font-medium">{categoryPendingDelete?.name}</span> has{" "}
                      <span className="font-medium">{linkedTransactionCount}</span>{" "}
                      {linkedTransactionCount === 1 ? "transaction" : "transactions"}. Please
                      delete all its transactions from the right panel before deleting this
                      category.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCategoryPendingDelete(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  {categoryPendingDelete
                    ? `Are you sure you want to delete ${categoryPendingDelete.name}? This action cannot be undone.`
                    : "Are you sure you want to delete this category?"}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isDeletingCategory}
                    onClick={() => setCategoryPendingDelete(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingCategory || !categoryPendingDelete}
                    onClick={() => {
                      if (!categoryPendingDelete) return;
                      void handleDeleteCategory(categoryPendingDelete);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                  >
                    {isDeletingCategory ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
