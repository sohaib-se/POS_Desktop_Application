import type { SaleTab } from "@/pages/AddSale";

interface AddSaleTopBarProps {
  activeTab: SaleTab;
  updateTab: (partial: Partial<SaleTab>) => void;
}

export function AddSaleTopBar({ activeTab, updateTab }: AddSaleTopBarProps) {
  return (
    <div style={{ background: "#fff", flexShrink: 0, padding: "8px 20px", display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #e5e7eb" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>Sale</span>

      {/* Credit ← toggle → Cash */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          onClick={() => updateTab({ paymentMode: "credit" })}
          style={{ fontSize: 13, fontWeight: 500, cursor: "pointer", userSelect: "none", color: activeTab.paymentMode === "credit" ? "#2563eb" : "#9ca3af" }}
        >
          Credit
        </span>
        <button
          onClick={() => updateTab({ paymentMode: activeTab.paymentMode === "credit" ? "cash" : "credit" })}
          style={{
            width: 38, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
            background: "#2563eb", position: "relative", padding: 0, flexShrink: 0,
          }}
        >
          <span style={{
            position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%",
            background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.15s",
            left: activeTab.paymentMode === "cash" ? 20 : 2,
          }} />
        </button>
        <span
          onClick={() => updateTab({ paymentMode: "cash" })}
          style={{ fontSize: 13, fontWeight: 500, cursor: "pointer", userSelect: "none", color: activeTab.paymentMode === "cash" ? "#2563eb" : "#9ca3af" }}
        >
          Cash
        </span>
      </div>
    </div>
  );
}
