import { useState, useEffect, useMemo, useRef } from "react";
import { RecycleBinHeader } from "@/components/pagescomponents/recycle/RecycleBinHeader";
import { RecycleBinFilters } from "@/components/pagescomponents/recycle/RecycleBinFilters";
import { RecycleBinTable } from "@/components/pagescomponents/recycle/RecycleBinTable";
import { RecycleBinFooter } from "@/components/pagescomponents/recycle/RecycleBinFooter";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import type { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";

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

  const [showEmptyTrashWarning, setShowEmptyTrashWarning] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Default: To = Today, From = One month before Today
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

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
      setIsEmptyingTrash(true);
      await fetch('/api/recycle_bin/empty', { method: 'DELETE' });
      fetchItems();
      setShowEmptyTrashWarning(false);
    } catch (e) {
      console.error('Failed to empty trash', e);
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (dateRange?.from && dateRange?.to) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);

      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);

      result = result.filter((item) => {
        const rawDate = item.deleted_on || item.transaction_date;
        if (!rawDate) return false;
        
        const safeDate = rawDate.replace(' ', 'T');
        const itemDate = new Date(safeDate);
        
        return itemDate >= start && itemDate <= end;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.party_name?.toLowerCase().includes(query) ||
        item.ref_no?.toLowerCase().includes(query) ||
        item.txn_type?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, dateRange, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6]">
      <RecycleBinHeader onEmptyTrash={() => setShowEmptyTrashWarning(true)} />
      <RecycleBinFilters 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
        searchInputRef={searchInputRef}
      />
      <RecycleBinTable
        items={filteredItems}
        isLoading={isLoading}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
      <RecycleBinFooter
        items={filteredItems}
        selectedIds={selectedIds}
        onActionComplete={() => {
          setSelectedIds([]);
          fetchItems();
        }}
      />
      
      <ConfirmDeleteModal
        isOpen={showEmptyTrashWarning}
        onClose={() => setShowEmptyTrashWarning(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash"
        message="Are you sure you want to permanently delete all items in the recycle bin? This action cannot be undone."
        isDeleting={isEmptyingTrash}
        confirmText="Empty Trash"
        confirmLoadingText="Emptying..."
      />
    </div>
  );
}
