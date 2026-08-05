import { ChevronDown, FileText, ChevronRight, AlertCircle } from "lucide-react";
import type { PosTab, PartyOption, BankOption } from "./types";

interface RightPanelProps {
  activeTab: PosTab;
  updateTab: (partial: Partial<PosTab>) => void;
  banks: BankOption[];
  totalAmount: number;
  effectiveAmountReceived: string;
  changeToReturn: number;
  receivedLessThanTotal: boolean;
  isSaving: boolean;
  handleSaveSale: () => void;
  customerDropdownOpen: boolean;
  setCustomerDropdownOpen: (open: boolean) => void;
  filteredCustomers: PartyOption[];
}

export function RightPanel({
  activeTab,
  updateTab,
  banks,
  totalAmount,
  effectiveAmountReceived,
  changeToReturn,
  receivedLessThanTotal,
  isSaving,
  handleSaveSale,
  customerDropdownOpen,
  setCustomerDropdownOpen,
  filteredCustomers,
}: RightPanelProps) {
  return (
    <div className="w-[380px] flex flex-col gap-2 shrink-0 overflow-hidden">
      {/* Top Section */}
      <div className="bg-white border border-gray-300 rounded shadow-sm p-3 space-y-3 relative">
        <div className="flex items-center justify-between rounded border border-gray-300 px-3 py-1 bg-white relative">
          <input
            type="date"
            value={activeTab.date}
            onChange={(e) => updateTab({ date: e.target.value })}
            className="w-full text-sm text-gray-800 outline-none bg-transparent"
          />
        </div>

        <div className="relative">
          <div
            className="flex items-center justify-between rounded border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 focus-within:ring-1 focus-within:ring-blue-500 cursor-text"
            onClick={(e) => {
              e.stopPropagation();
              setCustomerDropdownOpen(true);
              document.getElementById("customer-search-input")?.focus();
            }}
          >
            <input
              id="customer-search-input"
              type="text"
              value={activeTab.customerSearchText}
              onChange={(e) => {
                updateTab({
                  customerSearchText: e.target.value,
                  customerSelectedId: null,
                });
                setCustomerDropdownOpen(true);
              }}
              placeholder="Search for a customer by name, phone number [F11]"
              className="w-full text-sm outline-none bg-transparent text-gray-700 font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
            <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none absolute right-3" />
          </div>

          {/* Customer Dropdown */}
          {customerDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto z-50">
              <div
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 border-b border-gray-100"
                onClick={() => {
                  updateTab({
                    customerSearchText: "Cash Sale",
                    customerSelectedId: null,
                  });
                  setCustomerDropdownOpen(false);
                }}
              >
                Cash Sale (Default)
              </div>
              {filteredCustomers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400 italic">
                  No customers found.
                </div>
              ) : (
                filteredCustomers.map((p) => (
                  <div
                    key={p.id}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between text-sm text-gray-700"
                    onClick={() => {
                      updateTab({
                        customerSearchText: `${p.name} - ${p.phone}`,
                        customerSelectedId: p.id,
                      });
                      setCustomerDropdownOpen(false);
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-500">{p.phone}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 bg-white border border-gray-300 rounded shadow-sm flex flex-col">
        {/* Total Box */}
        <div className="m-3 rounded border border-blue-100 bg-blue-50/60 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-800">
                Total Rs {totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Items: {activeTab.rows.filter((r) => r.itemId).length}, Quantity:{" "}
                {activeTab.rows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0)}
              </p>
            </div>
          </div>
          <button className="flex flex-col items-end gap-0.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <div className="flex items-center">
              Full Breakup
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </div>
            <span className="text-xs text-blue-500 font-medium">[Ctrl+F]</span>
          </button>
        </div>

        {/* Payment Details */}
        <div className="px-3 pb-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">
              Payment Type
            </label>
            <div className="relative">
              <select
                value={activeTab.paymentMode}
                onChange={(e) => updateTab({ paymentMode: e.target.value })}
                className="w-full appearance-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="Cash">Cash</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">
              Amount Received
            </label>
            <div
              className={`flex items-center rounded border px-3 py-2 bg-white ${
                receivedLessThanTotal
                  ? "border-red-400 focus-within:ring-red-400"
                  : "border-gray-300"
              }`}
            >
              <span className="text-sm font-medium text-gray-500 mr-2">Rs</span>
              <input
                type="text"
                value={effectiveAmountReceived}
                onChange={(e) =>
                  updateTab({
                    amountReceived: e.target.value,
                    isAmountReceivedDirty: true,
                  })
                }
                className="w-full text-sm text-gray-800 text-right outline-none bg-transparent"
              />
            </div>
            {receivedLessThanTotal && (
              <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" />
                Received cannot be less than total
              </p>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Change to Return */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
          <span className="text-sm font-bold text-gray-700">
            Change to Return:
          </span>
          <span className="text-lg font-bold text-gray-800">
            Rs {changeToReturn.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border border-gray-300 rounded shadow-sm p-3 space-y-2 shrink-0">
        <button
          onClick={handleSaveSale}
          disabled={isSaving || receivedLessThanTotal}
          className="w-full rounded border border-green-400/60 bg-green-200/50 py-3.5 text-sm font-bold text-green-800 hover:bg-green-300/50 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save & Print Bill"}{" "}
          <span className="font-normal text-green-700 ml-1">[Ctrl+P]</span>
        </button>
        <button className="w-full rounded border border-blue-200 bg-white py-3 text-sm font-semibold text-blue-700 hover:bg-gray-50 transition-colors shadow-sm">
          Other/Credit Payments{" "}
          <span className="font-normal text-blue-600 ml-1">[Ctrl+M]</span>
        </button>
      </div>
    </div>
  );
}
