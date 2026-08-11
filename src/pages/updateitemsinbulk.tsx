import { useEffect, useState } from "react";
import { BulkUpdateTable } from "@/components/pagescomponents/utilities/updateitemsinbulk/BulkUpdateTable";
import { BulkUpdateFooter } from "@/components/pagescomponents/utilities/updateitemsinbulk/BulkUpdateFooter";
import { toast } from "sonner";

export function UpdateItemsInBulk() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleSelectionChange = (id: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItemIds(new Set(items.map(item => item.id)));
    } else {
      setSelectedItemIds(new Set());
    }
  };

  const handleItemEdit = (id: string, field: string, value: any) => {
    setPendingUpdates(prev => {
      const existingUpdates = prev[id] || {};
      return {
        ...prev,
        [id]: { ...existingUpdates, [field]: value }
      };
    });
  };

  const handleBulkUpdate = async () => {
    const updatesToProcess = Object.keys(pendingUpdates);
    
    if (updatesToProcess.length === 0) {
      toast.info("No changes to update.");
      return;
    }

    setIsUpdating(true);
    let successCount = 0;
    
    const camelize = (obj: any) => {
      const newObj: any = {};
      for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelKey] = obj[key];
      }
      return newObj;
    };
    
    for (const id of updatesToProcess) {
      const originalItem = items.find(item => item.id === id);
      if (!originalItem) continue;

      const camelCaseOriginal = camelize(originalItem);
      const updatedPayload = { ...camelCaseOriginal, ...pendingUpdates[id] };
      
      const qty = Number(updatedPayload.stockQuantity || 0);
      let newStockValue = 0;
      if (updatedPayload.atPrice !== undefined && updatedPayload.atPrice !== null && updatedPayload.atPrice !== "") {
        newStockValue = qty * Number(updatedPayload.atPrice);
      } else {
        newStockValue = qty * Number(updatedPayload.purchasePrice || 0);
      }
      updatedPayload.stockValue = newStockValue;
      
      try {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload)
        });
        if (response.ok) {
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to update item ${id}`, error);
      }
    }

    setIsUpdating(false);
    
    if (successCount > 0) {
      toast.success(`Successfully updated ${successCount} items.`);
      setPendingUpdates({});
      fetchItems();
    } else {
      toast.error("Failed to update items.");
    }
  };

  const updatesCount = Object.keys(pendingUpdates).length;

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-y-auto p-6 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex-1">
        <BulkUpdateTable 
          items={items}
          categories={categories}
          selectedItemIds={selectedItemIds}
          pendingUpdates={pendingUpdates}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onItemEdit={handleItemEdit}
        />
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-shrink-0">
        <BulkUpdateFooter 
          updatesCount={updatesCount}
          onUpdate={handleBulkUpdate}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
