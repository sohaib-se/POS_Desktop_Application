import { useState, useEffect, useMemo } from "react";
import { RecycleBinHeader } from "@/components/pagescomponents/recycle/RecycleBinHeader";
import { RecycleBinFilters } from "@/components/pagescomponents/recycle/RecycleBinFilters";
import { RecycleBinTable } from "@/components/pagescomponents/recycle/RecycleBinTable";
import { RecycleBinFooter } from "@/components/pagescomponents/recycle/RecycleBinFooter";
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
      await fetch('/api/recycle_bin/empty', { method: 'DELETE' });
      fetchItems();
    } catch (e) {
      console.error('Failed to empty trash', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return items;

    // Both From and To dates are inclusive.
    // Start of the day for From, End of the day for To
    const start = new Date(dateRange.from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateRange.to);
    end.setHours(23, 59, 59, 999);

    return items.filter((item) => {
      // Use the actual deletion timestamp/date stored with each deleted record
      // In recycle_bin schema, deleted_on defaults to datetime('now')
      const rawDate = item.deleted_on || item.transaction_date;
      if (!rawDate) return false;
      
      // SQLite datetime returns "YYYY-MM-DD HH:MM:SS", format for standard JS Date parsing
      const safeDate = rawDate.replace(' ', 'T');
      const itemDate = new Date(safeDate);
      
      return itemDate >= start && itemDate <= end;
    });
  }, [items, dateRange]);

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6]">
      <RecycleBinHeader onEmptyTrash={handleEmptyTrash} />
      <RecycleBinFilters dateRange={dateRange} setDateRange={setDateRange} />
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
    </div>
  );
}
