import { useState } from "react";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  Wallet,
  BarChart3,
  RefreshCw,
  Wrench,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react";
import type { ViewType } from "@/types";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  children?: { id: ViewType; label: string }[];
}

const menuItems: MenuItem[] = [
  { id: "home", label: "Home", icon: Home },
  {
    id: "parties",
    label: "Parties",
    icon: Users,
    children: [],
  },
  {
    id: "items",
    label: "Items",
    icon: Package,
    children: [],
  },
  {
    id: "sale-invoices",
    label: "Sale",
    icon: ShoppingCart,
    children: [
      { id: "sale-invoices", label: "Sale Invoices" },
      { id: "estimates", label: "Estimate/ Quotation" },
      { id: "payment-in", label: "Payment-In" },
      { id: "sale-return", label: "Sale Return/ Credit Note" },
      { id: "pos", label: "Vyapar POS" },
    ],
  },
  {
    id: "purchase-bills",
    label: "Purchase & Expense",
    icon: Receipt,
    children: [
      { id: "purchase-bills", label: "Purchase Bills" },
      { id: "payment-out", label: "Payment-Out" },
      { id: "expenses", label: "Expenses" },
      { id: "purchase-return", label: "Purchase Return/ Dr. Note" },
    ],
  },
  {
    id: "bank-accounts",
    label: "Cash & Bank",
    icon: Wallet,
    children: [
      { id: "bank-accounts", label: "Bank Accounts" },
      { id: "cash-in-hand", label: "Cash In Hand" },
      { id: "cheques", label: "Cheques" },
      { id: "loan-accounts", label: "Loan Accounts" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    children: [],
  },
  {
    id: "sync-share",
    label: "Sync, Share & Backup",
    icon: RefreshCw,
    children: [
      { id: "sync-share", label: "Sync & Share" },
      { id: "sync-auto-backup", label: "Auto Backup" },
      { id: "sync-backup-computer", label: "Backup to Computer" },
      { id: "sync-backup-drive", label: "Backup to Drive" },
      { id: "sync-restore-backup", label: "Restore Backup" },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Wrench,
    children: [
      { id: "utilities-import-items", label: "Import Items" },
      { id: "utilities-barcode", label: "Barcode Generator" },
      { id: "utilities-bulk-update", label: "Update Items In Bulk" },
      { id: "utilities-import-parties", label: "Import Parties" },
      { id: "utilities-export-tally", label: "Exports To Tally" },
      { id: "utilities-export-items", label: "Export Items" },
      { id: "utilities-verify-data", label: "Verify My Data" },
      { id: "utilities-recycle-bin", label: "Recycle Bin" },
    ],
  },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "sale-invoices",
  ]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => (prev.includes(menuId) ? [] : [menuId]));
  };

  const isActive = (itemId: string) => {
    return currentView === itemId;
  };

  const isChildActive = (children?: { id: ViewType; label: string }[]) => {
    return children?.some((child) => child.id === currentView) || false;
  };

  return (
    <div className="w-64 h-full bg-[#1e2538] flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Open Anything (Ctrl+F)"
            className="w-full bg-[#2a3142] text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin px-2"
        style={{ scrollbarGutter: "stable" }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus.includes(item.id);
          const active = isActive(item.id) || isChildActive(item.children);

          return (
            <div key={item.id}>
              <div
                onClick={() => {
                  if (hasChildren) {
                    toggleMenu(item.id);
                  } else {
                    onViewChange(item.id);
                  }
                }}
                className={`
                  flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-200 mb-0.5
                  ${
                    active
                      ? "bg-white/10 text-white border-l-4 border-[#E53935]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {!hasChildren && (
                    <Plus className="w-4 h-4 text-gray-500 hover:text-white" />
                  )}
                  {hasChildren && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              </div>

              {/* Submenu */}
              {hasChildren && isExpanded && (
                <div className="ml-4 pl-4 border-l border-gray-700 animate-dropdownExpand overflow-hidden">
                  {item.children?.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => onViewChange(child.id)}
                      className={`
                        flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 mb-0.5
                        ${
                          isActive(child.id)
                            ? "bg-white/10 text-white border-l-4 border-[#E53935]"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      <span>{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-700">
        <div
          onClick={() => onViewChange("edit-profile")}
          className="flex items-center justify-between text-gray-300 hover:text-white cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              L
            </div>
            <span className="text-sm">Laimsoft</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
