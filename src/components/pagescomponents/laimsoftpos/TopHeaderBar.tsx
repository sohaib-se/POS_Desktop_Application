import { Plus, X } from "lucide-react";
import type { PosTab } from "./types";

interface TopHeaderBarProps {
  tabs: PosTab[];
  activeTabId: number;
  setActiveTabId: (id: number) => void;
  handleCloseTab: (id: number) => void;
  handleNewBill: () => void;
  onClose?: () => void;
}

export function TopHeaderBar({
  tabs,
  activeTabId,
  setActiveTabId,
  handleCloseTab,
  handleNewBill,
  onClose,
}: TopHeaderBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-300 bg-white px-2 h-11 shrink-0">
      <div className="flex items-center h-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-4 px-4 h-full border-x border-gray-200 cursor-pointer ${
              activeTabId === tab.id
                ? "border-t-2 border-t-blue-500 bg-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <span
              className={`text-sm font-medium ${
                activeTabId === tab.id ? "text-blue-600" : "text-gray-600"
              }`}
            >
              #{tab.invoiceNo}
            </span>
            <span className="text-xs text-gray-400">Ctrl+W</span>
            <button
              className="hover:bg-red-100 hover:text-red-600 p-0.5 rounded text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          onClick={handleNewBill}
          className="ml-2 flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Bill
          <span className="text-xs text-gray-400 font-medium ml-1">
            [Ctrl+T]
          </span>
        </button>
      </div>

      <div className="flex items-center text-gray-500 shrink-0">
        <button
          className="p-2 hover:bg-red-500 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
