import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/common/ConfirmActionModal";
import type { RecycleBinItem } from "@/pages/recyclebin";

interface RecycleBinFooterProps {
  items: RecycleBinItem[];
  selectedIds: string[];
  onActionComplete: () => void;
}

export function RecycleBinFooter({ items, selectedIds, onActionComplete }: RecycleBinFooterProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  if (items.length === 0) return null;

  const hasSelection = selectedIds.length > 0;

  const handleRestore = async () => {
    if (!hasSelection) return;

    // Sort selected items by reverse-deletion order (newest deleted first)
    // items prop is ordered newest-deleted first (index 0 is newest)
    const selectedItemsSorted = items
      .filter((item) => selectedIds.includes(item.id))
      .sort((a, b) => items.indexOf(a) - items.indexOf(b));

    // Validate LIFO order: Check if any selected item has an unselected item deleted AFTER it
    for (const selectedItem of selectedItemsSorted) {
      const selectedIndex = items.indexOf(selectedItem);
      // Items with index < selectedIndex were deleted AFTER selectedItem
      const newerUnselectedItem = items.find(
        (it, idx) => idx < selectedIndex && !selectedIds.includes(it.id)
      );

      if (newerUnselectedItem) {
        const newerLabel = newerUnselectedItem.party_name || newerUnselectedItem.ref_no || newerUnselectedItem.txn_type || 'record';
        const selectedLabel = selectedItem.party_name || selectedItem.ref_no || selectedItem.txn_type || 'record';
        setWarningModal({
          isOpen: true,
          title: "Restoration Order Constraint",
          message: `Items must be restored in reverse order of deletion. The ${newerUnselectedItem.txn_type} '${newerLabel}' was deleted after '${selectedLabel}'. Please restore '${newerLabel}' first or select both together.`,
        });
        return;
      }
    }

    setIsRestoring(true);
    try {
      for (const item of selectedItemsSorted) {
        const res = await fetch('/api/recycle_bin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setWarningModal({
            isOpen: true,
            title: "Restore Failed",
            message: errData.message || "Failed to restore item.",
          });
          break;
        }
      }
      onActionComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeletePermanently = async () => {
    if (!hasSelection) return;
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/recycle_bin?id=${id}`, {
          method: 'DELETE',
        });
      }
      onActionComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white p-4 border-t border-gray-200 flex justify-end gap-4 mt-auto">
        <Button 
          variant="destructive"
          className="font-medium px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!hasSelection || isRestoring || isDeleting}
          onClick={handleDeletePermanently}
        >
          {isDeleting ? 'Deleting...' : 'Delete Permanently'}
        </Button>
        <Button 
          className={`font-medium px-10 text-white ${
            hasSelection && !isRestoring && !isDeleting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer'
              : 'bg-indigo-300 opacity-50 cursor-not-allowed'
          }`}
          disabled={!hasSelection || isRestoring || isDeleting}
          onClick={handleRestore}
        >
          {isRestoring ? 'Restoring...' : 'Restore'}
        </Button>
      </div>

      <ConfirmActionModal
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setWarningModal((prev) => ({ ...prev, isOpen: false }))}
        title={warningModal.title}
        message={warningModal.message}
        confirmText="OK"
        hideCancel={true}
      />
    </>
  );
}
