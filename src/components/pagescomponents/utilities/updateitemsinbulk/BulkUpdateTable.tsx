import { useState, useMemo } from "react";
import { Search } from "lucide-react";

interface BulkUpdateTableProps {
  items: any[];
  categories: any[];
  selectedItemIds: Set<string>;
  pendingUpdates: Record<string, any>;
  onSelectionChange: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onItemEdit: (id: string, field: string, value: any) => void;
}

export function BulkUpdateTable({
  items,
  categories,
  selectedItemIds,
  pendingUpdates,
  onSelectionChange,
  onSelectAll,
  onItemEdit
}: BulkUpdateTableProps) {
  const [activeTab, setActiveTab] = useState<"pricing" | "stock" | "info">("pricing");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const allSelected = filteredItems.length > 0 && filteredItems.every(item => selectedItemIds.has(item.id));

  const getValue = (item: any, field: string) => {
    if (pendingUpdates[item.id] && pendingUpdates[item.id][field] !== undefined) {
      return pendingUpdates[item.id][field];
    }
    const snakeCaseField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const value = item[field] !== undefined ? item[field] : item[snakeCaseField];
    return value !== null && value !== undefined ? value : "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Bulk Update Items
        </h3>
        
        <div className="relative w-80 mr-auto ml-16">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("pricing")}
            className={`flex items-center gap-2 text-sm ${activeTab === "pricing" ? "text-gray-700" : "text-gray-500"}`}
          >
            <div
              className={`flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 ${activeTab === "pricing" ? "border-blue-500" : "border-gray-400"}`}
            >
              {activeTab === "pricing" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            Pricing
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center gap-2 text-sm ${activeTab === "stock" ? "text-gray-700" : "text-gray-500"}`}
          >
            <div
              className={`flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 ${activeTab === "stock" ? "border-blue-500" : "border-gray-400"}`}
            >
              {activeTab === "stock" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            Stock
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 text-sm ${activeTab === "info" ? "text-gray-700" : "text-gray-500"}`}
          >
            <div
              className={`flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 ${activeTab === "info" ? "border-blue-500" : "border-gray-400"}`}
            >
              {activeTab === "info" && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            Item Information
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#EAF2FE] border-b border-gray-200">
          <span className="text-sm text-gray-600 font-medium">{selectedItemIds.size} items selected</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="divide-x divide-gray-200">
              <th className="px-4 py-2 w-10">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600 w-12">
                #
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                ITEM NAME *
              </th>
              {activeTab === "pricing" && (
                <>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    CATEGORY
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    PURCHASE PRICE
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    SALE PRICE
                  </th>
                </>
              )}
              {activeTab === "stock" && (
                <>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[120px]">
                    OPENING QUANT...
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[100px]">
                    AT PRICE
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[110px]">
                    AS OF DATE
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[110px]">
                    LOW STOCK
                  </th>
                </>
              )}
              {activeTab === "info" && (
                <>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[150px]">
                    CATEGORY
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600 min-w-[150px]">
                    ITEM CODE
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const inputClasses = "w-full bg-transparent border border-transparent group-hover:border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors min-w-[60px]";
              const tdClasses = "px-2 py-1";
              
              return (
                <tr
                  key={item.id}
                  className={`group border-b border-gray-200 divide-x divide-gray-200 hover:bg-gray-50 last:border-b-0 ${selectedItemIds.has(item.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className={`${tdClasses} px-4`}>
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedItemIds.has(item.id)}
                      onChange={() => onSelectionChange(item.id)}
                    />
                  </td>
                  <td className={`${tdClasses} px-4`}>{index + 1}</td>
                  <td className={tdClasses}>
                    <input 
                      type="text" 
                      value={getValue(item, 'name')} 
                      onChange={(e) => onItemEdit(item.id, 'name', e.target.value)}
                      className={inputClasses} 
                    />
                  </td>
                  {activeTab === "pricing" && (
                    <>
                      <td className={tdClasses}>
                        <select 
                          className={inputClasses}
                          value={getValue(item, 'category')}
                          onChange={(e) => onItemEdit(item.id, 'category', e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="number" 
                          value={getValue(item, 'purchasePrice')} 
                          onChange={(e) => onItemEdit(item.id, 'purchasePrice', Number(e.target.value))}
                          className={inputClasses} 
                        />
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="number" 
                          value={getValue(item, 'salePrice')} 
                          onChange={(e) => onItemEdit(item.id, 'salePrice', Number(e.target.value))}
                          className={inputClasses} 
                        />
                      </td>
                    </>
                  )}
                  {activeTab === "stock" && (
                    <>
                      <td className={tdClasses}>
                        <input 
                          type="number" 
                          value={getValue(item, 'stockQuantity')} 
                          onChange={(e) => onItemEdit(item.id, 'stockQuantity', Number(e.target.value))}
                          className={inputClasses} 
                        />
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="number" 
                          value={getValue(item, 'atPrice')} 
                          onChange={(e) => onItemEdit(item.id, 'atPrice', Number(e.target.value))}
                          className={inputClasses} 
                        />
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="text" 
                          value={getValue(item, 'mfgDate')} 
                          onChange={(e) => onItemEdit(item.id, 'mfgDate', e.target.value)}
                          className={inputClasses} 
                        />
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="number" 
                          value={getValue(item, 'lowStock')} 
                          onChange={(e) => onItemEdit(item.id, 'lowStock', Number(e.target.value))}
                          className={inputClasses} 
                        />
                      </td>
                    </>
                  )}
                  {activeTab === "info" && (
                    <>
                      <td className={tdClasses}>
                        <select 
                          className={inputClasses}
                          value={getValue(item, 'category')}
                          onChange={(e) => onItemEdit(item.id, 'category', e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={tdClasses}>
                        <input 
                          type="text" 
                          value={getValue(item, 'code')} 
                          onChange={(e) => onItemEdit(item.id, 'code', e.target.value)}
                          className={inputClasses} 
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
