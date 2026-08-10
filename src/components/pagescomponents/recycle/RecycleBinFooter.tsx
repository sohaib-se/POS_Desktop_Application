import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { RecycleBinItem } from "@/pages/recyclebin";

interface RecycleBinFooterProps {
  items: RecycleBinItem[];
  selectedIds: string[];
  onActionComplete: () => void;
}

export function RecycleBinFooter({ items, selectedIds, onActionComplete }: RecycleBinFooterProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  if (items.length === 0) return null;

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const idsToRestore = selectedIds.length > 0 ? selectedIds : items.map(item => item.id);
      for (const id of idsToRestore) {
        await fetch('/api/recycle_bin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      }
      onActionComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200 flex justify-end mt-auto">
      <Button 
        className="bg-indigo-300 hover:bg-indigo-400 text-white font-medium px-10"
        disabled={isRestoring}
        onClick={handleRestore}
      >
        {isRestoring ? 'Restoring...' : 'Restore'}
      </Button>
    </div>
  );
}
