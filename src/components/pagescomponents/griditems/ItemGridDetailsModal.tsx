import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Item } from "@/components/pagescomponents/items/products/types";
import { Package, Calendar } from "lucide-react";

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
      <DialogContent className="sm:max-w-[60vw] max-w-[95vw] w-[95vw] md:w-[60vw] h-[90vh] md:h-[75vh] bg-white p-0 overflow-hidden rounded-[2rem] flex flex-col md:flex-row shadow-2xl border-0">
        
        {/* Left Side: Image Area */}
        <div className="relative w-full md:w-[40%] h-48 md:h-full bg-gray-50/50 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-8">
          {item.imgPath ? (
            <img 
              src={item.imgPath} 
              alt={item.name} 
              className="w-full h-full object-contain filter drop-shadow-md transition-transform hover:scale-105 duration-500" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
              <Package size={80} className="mb-4 opacity-50" strokeWidth={1} />
              <span className="font-medium text-lg tracking-wide text-gray-400">No Image</span>
            </div>
          )}
          {/* Badge Overlay */}
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider shadow-sm border border-gray-100/50 uppercase">
            {item.category || "Uncategorized"}
          </div>
        </div>

        {/* Right Side: Details Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <DialogHeader className="px-8 pt-8 pb-4 shrink-0 text-left">
            <DialogTitle className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{item.name}</DialogTitle>
            {item.code && <p className="text-sm text-gray-500 font-mono mt-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {item.code}</p>}
          </DialogHeader>

          {/* Custom Tabs */}
          <div className="flex gap-6 px-8 border-b border-gray-100 shrink-0">
            {(["info", "pricing", "stock"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize transition-all relative ${
                  activeTab === tab 
                    ? "text-gray-900" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="px-8 py-6 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* INFO TAB */}
            {activeTab === "info" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Category</span>
                    <span className="text-base text-gray-900 font-medium">{item.category || "-"}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Item Code</span>
                    <span className="text-base text-gray-900 font-mono">{item.code || "-"}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Base Unit</span>
                    <span className="text-base text-gray-900 font-medium">{item.unit || "-"}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Primary Unit</span>
                    <span className="text-base text-gray-900 font-medium">{item.primaryUnit || "-"}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Mfg Date</span>
                      <span className="text-sm text-gray-900 font-medium">{item.mfgDate ? new Date(item.mfgDate).toLocaleDateString() : "-"}</span>
                    </div>
                  </div>
                  <div className="group flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      <Calendar size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Exp Date</span>
                      <span className="text-sm text-gray-900 font-medium">{item.expDate ? new Date(item.expDate).toLocaleDateString() : "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === "pricing" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Sale Price (Retail)</span>
                    <span className="text-base text-gray-900 font-medium">Rs {item.salePrice?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Wholesale Price (B2B)</span>
                    <span className="text-base text-gray-900 font-medium">Rs {item.wholesalePrice?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Purchase Price (Cost)</span>
                    <span className="text-base text-gray-900 font-medium">Rs {item.purchasePrice?.toLocaleString() ?? 0}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">At Price (Custom)</span>
                    <span className="text-base text-gray-900 font-medium">Rs {item.atPrice?.toLocaleString() ?? 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STOCK TAB */}
            {activeTab === "stock" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Total Stock Quantity</span>
                    <span className={`text-base font-medium ${item.stockQuantity <= (item.lowStock || 0) ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stockQuantity}
                    </span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Stock Value</span>
                    <span className="text-base text-gray-900 font-medium">
                      Rs {item.stockValue?.toLocaleString() ?? 0}
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Primary Stock</span>
                    <span className="text-base text-gray-900 font-medium">{item.stockQuantity}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Secondary Stock</span>
                    <span className="text-base text-gray-900 font-medium">{item.secondaryStock ?? "-"}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Low Alert Threshold</span>
                    <span className="text-base text-gray-900 font-medium">{item.lowStock ?? "-"}</span>
                  </div>
                  <div className="group">
                    <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Min Wholesale Qty</span>
                    <span className="text-base text-gray-900 font-medium">{item.minStock ?? "-"}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
