import { useState, useEffect, useMemo } from "react";
import type { Item } from "@/components/pagescomponents/items/products/types";
import { ItemGridCard } from "./ItemGridCard";
import { ItemGridDetailsModal } from "./ItemGridDetailsModal";

interface GridContainerProps {
  selectedCategory: string;
}

export function GridContainer({ selectedCategory }: GridContainerProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        if (res.ok) {
          const data = await res.json();
          // Assuming API returns array of items that match Item type structure,
          // Map snake_case to camelCase if necessary. 
          // The previous version just did setItems(data).
          // If the DB returns snake_case, we should map it to match `Item`.
          // Let's map it safely.
          const mappedItems = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code || d.item_code,
            category: d.category,
            imgPath: d.img_path,
            unit: d.unit,
            primaryUnit: d.primary_unit,
            secondaryUnit: d.secondary_unit,
            secondaryStock: d.secondary_stock,
            stockQuantity: d.stock_quantity ?? d.opening_quantity ?? 0,
            salePrice: d.sale_price ?? 0,
            purchasePrice: d.purchase_price ?? 0,
            wholesalePrice: d.wholesale_price ?? 0,
            atPrice: d.at_price ?? 0,
            stockValue: d.stock_value ?? 0,
            lowStock: d.low_stock ?? null,
            minStock: d.min_stock ?? null,
            mfgDate: d.mfg_date,
            expDate: d.exp_date,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Failed to fetch items for grid", err);
      }
    }
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All Items") return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
        {filteredItems.map((item) => (
          <ItemGridCard 
            key={item.id} 
            item={item} 
            onDetailClick={() => setSelectedItem(item)} 
          />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg font-medium">No items found in this category.</p>
        </div>
      )}

      {/* Details Modal */}
      <ItemGridDetailsModal 
        item={selectedItem} 
        open={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
