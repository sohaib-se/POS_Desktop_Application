import { ChevronDown, FileText, AlertCircle, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
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
  filteredCustomers: PartyOption[];
  onAddParty?: () => void;
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
  filteredCustomers,
  onAddParty,
}: RightPanelProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedPartyObj = filteredCustomers.find(
    (p) => String(p.id) === String(activeTab.customerSelectedId)
  );

  const searchedCustomers = filteredCustomers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery))
  );

  const receivedVal = Number(effectiveAmountReceived) || 0;
  const remainingAmount = Math.max(0, totalAmount - receivedVal);
  const isCashSale = activeTab.customerSelectedId === null;
  const isRemaining = remainingAmount > 0 && !isCashSale; // Only for credit sales

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

        <div style={{ position: "relative", width: "100%" }} ref={dropdownRef}>
          <label style={{ position: "absolute", top: -8, left: 12, background: "#fff", padding: "0 4px", fontSize: 12, color: "#3b82f6", fontWeight: 500, zIndex: 1 }}>
            Party <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              value={dropdownOpen ? searchQuery : (activeTab.customerSelectedId ? (selectedPartyObj ? selectedPartyObj.name : "") : "Cash Sale")}
              onChange={(e) => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
              onFocus={() => { setSearchQuery(activeTab.customerSelectedId ? (selectedPartyObj ? selectedPartyObj.name : "") : ""); setDropdownOpen(true); }}
              onClick={() => { setDropdownOpen(true); setSearchQuery(activeTab.customerSelectedId ? (selectedPartyObj ? selectedPartyObj.name : "") : ""); }}
              placeholder="Search by Name/Phone"
              style={{
                border: "1.5px solid #3b82f6", borderRadius: 4,
                padding: "8px 30px 8px 12px", width: "100%", height: 38,
                fontSize: 13, color: "#1f2937", outline: "none"
              }}
            />
            <ChevronDown size={16} color="#1f2937" style={{ position: "absolute", right: 10, pointerEvents: "none" }} />
          </div>

          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "100%", left: 0, width: "100%",
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 4, marginTop: 4,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 50
            }}>
              {/* Add Party button */}
              <div
                style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onAddParty?.();
                  setDropdownOpen(false);
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#3b82f6", fontSize: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #3b82f6" }}>
                    <Plus size={12} strokeWidth={3} />
                  </div>
                  Add Party
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Party Balance</span>
              </div>
              
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    updateTab({
                      customerSelectedId: null,
                      customerSearchText: "Cash Sale",
                    });
                    setDropdownOpen(false);
                  }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>Cash Sale (Default)</span>
                </div>

                {searchedCustomers.map((p) => {
                  const balance = Number(p.balance) || 0;
                  return (
                    <div
                      key={p.id}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        updateTab({
                          customerSelectedId: p.id,
                          customerSearchText: p.name,
                        });
                        setDropdownOpen(false);
                      }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{p.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{Math.abs(balance).toFixed(2)}</span>
                        {balance < 0 ? (
                          <div style={{ background: "#ef4444", borderRadius: 2, padding: 2, color: "#fff", display: "flex" }}>
                            <ArrowUpRight size={14} />
                          </div>
                        ) : (
                          <div style={{ background: "#10b981", borderRadius: 2, padding: 2, color: "#fff", display: "flex" }}>
                            <ArrowDownRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {selectedPartyObj && (
          <div className="mt-2 text-[13px] font-medium text-gray-700 flex justify-between bg-gray-50 p-2 rounded border border-gray-200">
            <span>Current Balance:</span>
            <span className={Number(selectedPartyObj.balance) > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
              {currencyStr} {Number(selectedPartyObj.balance || 0).toFixed(2)}
            </span>
          </div>
        )}
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
                Total {currencyStr} {totalAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Items: {activeTab.rows.filter((r) => r.itemId).length}, Quantity:{" "}
                {activeTab.rows.reduce((acc, r) => acc + (Number(r.qty) || 0), 0)}
              </p>
            </div>
          </div>
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
              <span className="text-sm font-medium text-gray-500 mr-2">{currencyStr}</span>
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

        {/* Change to Return / Remaining */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
          <span className="text-sm font-bold text-gray-700">
            {isRemaining ? "Remaining:" : "Change to Return:"}
          </span>
          <span className={`text-lg font-bold ${isRemaining ? "text-red-600" : "text-gray-800"}`}>
            {currencyStr} {isRemaining ? remainingAmount.toFixed(2) : changeToReturn.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border border-gray-300 rounded shadow-sm p-3 shrink-0">
        <button
          onClick={handleSaveSale}
          disabled={isSaving || receivedLessThanTotal}
          className="w-full rounded border border-green-400/60 bg-green-200/50 py-3.5 text-sm font-bold text-green-800 hover:bg-green-300/50 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Complete Sale"}{" "}
          <span className="font-normal text-green-700 ml-1">[Ctrl+P]</span>
        </button>
      </div>
    </div>
  );
}
