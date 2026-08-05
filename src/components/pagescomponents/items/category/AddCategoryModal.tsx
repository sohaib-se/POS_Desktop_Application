import { X } from "lucide-react";
import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  open: boolean;
  categoryBeingEdited: CategoryRecord | null;
  newCategoryName: string;
  onSetNewCategoryName: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function AddCategoryModal({
  open,
  categoryBeingEdited,
  newCategoryName,
  onSetNewCategoryName,
  onClose,
  onSave,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
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
              onClick={onClose}
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
              onChange={(event) => onSetNewCategoryName(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Grocery"
            />
          </div>
          <button
            onClick={onSave}
            disabled={!newCategoryName.trim()}
            className="w-full bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium"
          >
            {categoryBeingEdited ? "Update" : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
