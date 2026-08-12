import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Item } from "@/components/pagescomponents/items/products/types";
import { Package, Tag, Layers, DollarSign, AlertCircle, Calendar, Box } from "lucide-react";

interface ItemGridDetailsModalProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
}

export function ItemGridDetailsModal({ item, open, onClose }: ItemGridDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "pricing" | "stock">("info");

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white p-0 overflow-hidden rounded-2xl flex flex-col">
        
        {/* Header Image Area */}
        <div className="relative h-40 bg-gray-100 flex items-center justify-center shrink-0">
          {item.imgPath ? (
            <img 
              src={item.imgPath} 
              alt={item.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Package size={64} className="mb-2 opacity-50" />
              <span className="font-medium text-lg">No Image</span>
            </div>
          )}
          {/* Badge Overlay */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {item.category || "Uncategorized"}
          </div>
        </div>

        <DialogHeader className="px-6 pt-4 pb-3 shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900">{item.name}</DialogTitle>
          {item.code && <p className="text-sm text-gray-500 font-mono mt-1">Code: {item.code}</p>}
        </DialogHeader>

        {/* Custom Tabs */}
        <div className="flex gap-2 px-6 pb-4 shrink-0">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "info" 
                ? "bg-gray-900 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "pricing" 
                ? "bg-gray-900 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "stock" 
                ? "bg-gray-900 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Stock
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-6 pt-2 flex-1 bg-white">
          
          {/* INFO TAB */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Item Name</span>
                  <span className="text-sm text-gray-900 font-medium">{item.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Category</span>
                  <span className="text-sm text-gray-900 font-medium">{item.category || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Item Code</span>
                  <span className="text-sm text-gray-900 font-mono">{item.code || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Unit</span>
                  <span className="text-sm text-gray-900 font-medium">{item.unit || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Primary Unit</span>
                  <span className="text-sm text-gray-900 font-medium">{item.primaryUnit || "-"}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Secondary Unit</span>
                  <span className="text-sm text-gray-900 font-medium">{item.secondaryUnit || "-"}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Manufacturing Date</span>
                  <span className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" /> 
                    {item.mfgDate ? new Date(item.mfgDate).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</span>
                  <span className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" /> 
                    {item.expDate ? new Date(item.expDate).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Created Date</span>
                  <span className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" /> 
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-1">Updated Date</span>
                  <span className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" /> 
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PRICING TAB */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <Tag size={20} />
                  </div>
                  <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">Sale Price</span>
                </div>
                <span className="text-xl font-bold text-green-700">Rs {item.salePrice?.toLocaleString() ?? 0}</span>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                    <Tag size={20} />
                  </div>
                  <span className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Wholesale Price</span>
                </div>
                <span className="text-xl font-bold text-purple-700">Rs {item.wholesalePrice?.toLocaleString() ?? 0}</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <DollarSign size={20} />
                  </div>
                  <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Purchase Price</span>
                </div>
                <span className="text-xl font-bold text-blue-700">Rs {item.purchasePrice?.toLocaleString() ?? 0}</span>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-700">
                    <Tag size={20} />
                  </div>
                  <span className="text-sm font-semibold text-orange-800 uppercase tracking-wide">At Price</span>
                </div>
                <span className="text-xl font-bold text-orange-700">Rs {item.atPrice?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          )}

          {/* STOCK TAB */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Stock Quantity</span>
                  <span className={`text-2xl font-bold ${item.stockQuantity <= (item.lowStock || 0) ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stockQuantity}
                  </span>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stock Value</span>
                  <span className="text-2xl font-bold text-gray-900">
                    Rs {item.stockValue?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Box size={16} className="text-gray-400" /> Primary Stock
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.stockQuantity}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Box size={16} className="text-gray-400" /> Secondary Stock
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.secondaryStock ?? "-"}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-400" /> Low Stock Threshold
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.lowStock ?? "-"}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Layers size={16} className="text-purple-400" /> Min Wholesale Qty
                    </span>
                    <span className="text-sm font-bold text-gray-900">{item.minStock ?? "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
