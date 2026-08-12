import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export function LowStockItemsCard() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("/api/items");
        if (!res.ok) return;
        const items = await res.json();
        
        const filtered = items.filter((item: any) => {
          const stock = Number(item.stock_quantity ?? 0);
          const threshold = Number(item.low_stock);
          return !isNaN(threshold) && item.low_stock !== null && stock < threshold;
        });

        setLowStockItems(filtered.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch low stock items:", err);
      }
    }
    fetchItems();
  }, []);

  return (
    <div className="col-span-2 stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-medium text-gray-900">Low Stock Items</p>
        </div>
      </div>
      
      {lowStockItems.length === 0 ? (
        <div className="text-sm text-gray-500 py-4 text-center">No low stock items</div>
      ) : (
        <div className="space-y-3">
          {lowStockItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">Threshold: {item.low_stock} {item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">{item.stock_quantity}</p>
                <p className="text-xs text-red-500">In Stock</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
