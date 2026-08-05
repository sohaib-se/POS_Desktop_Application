import { useState } from "react";
import { Search, Play } from "lucide-react";
import { items } from "@/data/mockData";

export function BulkUpdateTable() {
  const [activeTab, setActiveTab] = useState<"pricing" | "stock" | "info">(
    "pricing",
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "pricing" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "pricing" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Pricing
            </button>
            <button
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "stock" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "stock" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Stock
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "info" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "info" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Item Information
            </button>
          </div>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600">
            Update Tax Slab
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                #
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                ITEM NAME *
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                CATEGORY
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                PURCHASE PRICE
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                SALE PRICE
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.category?.split(",").map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    defaultValue={item.purchasePrice}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    defaultValue={item.salePrice}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Play className="w-4 h-4 text-red-500" />
          <span>Watch Youtube tutorial to learn more</span>
        </div>
        <button className="bg-[#E53935] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Play className="w-4 h-4" />
          Watch Video
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <span className="text-sm text-gray-500">
          Pricing - 0 Updates, Stock - 0 Updates, Item Information - 0 Updates
        </span>
        <button className="px-6 py-2 bg-gray-300 text-white rounded-lg text-sm">
          Update
        </button>
      </div>
    </div>
  );
}
