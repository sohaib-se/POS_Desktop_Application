import { useState, useEffect } from "react";
import { RecycleBinHeader } from "@/components/pagescomponents/recycle/RecycleBinHeader";
import { RecycleBinFilters } from "@/components/pagescomponents/recycle/RecycleBinFilters";
import { RecycleBinTable } from "@/components/pagescomponents/recycle/RecycleBinTable";
import { RecycleBinFooter } from "@/components/pagescomponents/recycle/RecycleBinFooter";

export interface RecycleBinItem {
  id: string;
  transaction_date: string;
  ref_no: string;
  party_name: string;
  txn_type: string;
  payment_type: string;
  amount: number;
  deleted_on: string;
}

export function RecycleBin() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/recycle_bin');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error('Failed to fetch recycle bin items', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await fetch('/api/recycle_bin/empty', { method: 'DELETE' });
      fetchItems();
    } catch (e) {
      console.error('Failed to empty trash', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6]">
      <RecycleBinHeader onEmptyTrash={handleEmptyTrash} />
      <RecycleBinFilters />
      <RecycleBinTable 
        items={items}
        isLoading={isLoading}
        selectedIds={selectedIds} 
        setSelectedIds={setSelectedIds} 
      />
      <RecycleBinFooter 
        items={items}
        selectedIds={selectedIds} 
        onActionComplete={() => {
          setSelectedIds([]);
          fetchItems();
        }}
      />
    </div>
  );
}
