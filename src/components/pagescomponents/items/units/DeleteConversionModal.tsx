import type { ConversionRateRecord } from "@/components/pagescomponents/items/products/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui";

type Props = {
  conversionPendingDelete: ConversionRateRecord | null;
  isDeletingConversion: boolean;
  onCancel: () => void;
  onConfirm: (conversion: ConversionRateRecord) => void;
};

export function DeleteConversionModal({
  conversionPendingDelete,
  isDeletingConversion,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={Boolean(conversionPendingDelete)}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeletingConversion) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Conversion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this conversion rate?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDeletingConversion}
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingConversion || !conversionPendingDelete}
              onClick={() => {
                if (!conversionPendingDelete) return;
                onConfirm(conversionPendingDelete);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              {isDeletingConversion ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
