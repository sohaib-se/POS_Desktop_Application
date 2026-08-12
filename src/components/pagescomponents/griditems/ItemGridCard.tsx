import { Info, Package } from "lucide-react";
import type { Item } from "@/components/pagescomponents/items/products/types";

interface ItemGridCardProps {
  item: Item;
  onDetailClick: () => void;
}

export function ItemGridCard({ item, onDetailClick }: ItemGridCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-all h-[300px] relative">
      
      {/* Detail Button (Top Right) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick();
        }}
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 transition-colors"
        title="View Details"
      >
        <Info size={18} />
      </button>

      {/* Image Section (Top, no padding, fixed size) */}
      <div className="h-[180px] w-full bg-gray-50 flex items-center justify-center shrink-0 border-b border-gray-100 overflow-hidden">
        {item.imgPath ? (
          <img 
            src={item.imgPath} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package size={40} className="mb-1 opacity-40" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
      </div>

      {/* Info Section (Bottom) */}
      <div className="p-3 flex flex-col flex-1 bg-white">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1" title={item.name}>
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Price</span>
            <span className="text-sm font-bold text-gray-900">Rs {item.salePrice?.toLocaleString() ?? 0}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Qty</span>
            <span className={`text-sm font-bold ${item.stockQuantity <= (item.lowStock || 0) ? 'text-red-600' : 'text-blue-600'}`}>
              {item.stockQuantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
