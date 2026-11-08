import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";
import { useTranslation } from "react-i18next";

type Props = {
  categoryPendingDelete: CategoryRecord | null;
  isDeletingCategory: boolean;
  onCancel: () => void;
  onConfirm: (category: CategoryRecord) => void;
};

export function DeleteCategoryModal({
  categoryPendingDelete,
  isDeletingCategory,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={Boolean(categoryPendingDelete)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeletingCategory) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("items.deleteCategory")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {categoryPendingDelete
              ? t("items.deleteCategoryConfirm", { name: categoryPendingDelete.name })
              : t("items.deleteCategoryGeneric")}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingCategory}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={isDeletingCategory || !categoryPendingDelete}
              onClick={() => {
                if (!categoryPendingDelete) return;
                onConfirm(categoryPendingDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingCategory ? t("parties.deleting") : t("common.delete")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
