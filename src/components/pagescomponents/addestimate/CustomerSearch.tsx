import { useState, useMemo, useRef, useEffect } from "react";
import type { SaleTab } from "./types";
import { Plus, ArrowUpRight, ArrowDownRight, ChevronDown } from "lucide-react";

interface CustomerSearchProps {
  activeTab: SaleTab;
  updateTab: (partial: Partial<SaleTab>) => void;
  parties: any[];
  setShowAddParty: (show: boolean) => void;
}

export function CustomerSearch({ activeTab, updateTab, parties, setShowAddParty }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedParty = useMemo(() => {
    return parties.find(p => String(p.id) === activeTab.customerSearch || p.name === activeTab.customerSearch);
  }, [parties, activeTab.customerSearch]);

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.phone && p.phone.includes(search))
  );

  return (
    <div style={{ background: "#fff", padding: "25px 20px 80px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          
          <div style={{ position: "relative", width: 280 }} ref={dropdownRef}>
            <label style={{ position: "absolute", top: -8, left: 12, background: "#fff", padding: "0 4px", fontSize: 12, color: "#3b82f6", fontWeight: 500, zIndex: 1 }}>
              Party <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={open ? search : (selectedParty ? selectedParty.name : "")}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                onFocus={() => { setOpen(true); setSearch(selectedParty ? selectedParty.name : ""); }}
                onClick={() => { setOpen(true); setSearch(selectedParty ? selectedParty.name : ""); }}
                placeholder="Search by Name/Phone"
                style={{ border: "1.5px solid #3b82f6", borderRadius: 4, padding: "8px 30px 8px 12px", width: "100%", height: 38, fontSize: 13, color: "#1f2937", outline: "none" }}
              />
              <ChevronDown size={16} color="#1f2937" style={{ position: "absolute", right: 10, pointerEvents: "none" }} />
            </div>

            {open && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: 320, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, marginTop: 4, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", zIndex: 50 }}>
                <div 
                  style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onMouseDown={(e) => { 
                    e.preventDefault();
                    setShowAddParty(true); 
                    setOpen(false); 
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
                  {filteredParties.map(p => {
                    const balance = Number(p.balance) || 0;
                    return (
                      <div 
                        key={p.id}
                        onPointerDown={(e) => {
                          e.preventDefault(); 
                          updateTab({ customerSearch: String(p.id) }); 
                          setOpen(false); 
                        }}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{p.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{Math.abs(balance)}</span>
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

        </div>

        <div style={{ fontSize: 13, textAlign: "right", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 8 }}>
            <span style={{ color: "#6b7280" }}>Ref No.</span>
            <input 
              type="text" 
              value={activeTab.estimateNo}
              onChange={(e) => updateTab({ estimateNo: e.target.value })}
              style={{
                border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#1f2937",
                padding: "3px 8px", width: 120, fontWeight: 600
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <span style={{ color: "#6b7280" }}>Invoice Date</span>
            <input 
              type="date"
              value={activeTab.estimateDate}
              onChange={(e) => updateTab({ estimateDate: e.target.value })}
              style={{
                border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, color: "#1f2937",
                padding: "3px 8px", width: 120, fontWeight: 600, cursor: "pointer"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
