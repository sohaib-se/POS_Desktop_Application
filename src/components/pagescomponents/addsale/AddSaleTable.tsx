import type { SaleTab, SaleRow, ItemOption } from "@/pages/AddSale";

interface AddSaleTableProps {
  activeTab: SaleTab;
  items: ItemOption[];
  updateRowItem: (rowId: number, itemId: string) => void;
  updateRow: (rowId: number, field: keyof SaleRow, value: string) => void;
  addRow: () => void;
  widths: number[];
  startResize: (col: number, e: React.MouseEvent) => void;
  totalQty: number;
  totalAmount: number;
  onBarcodeClick: () => void;
}

export function AddSaleTable({
  activeTab,
  items,
  updateRowItem,
  updateRow,
  addRow,
  widths,
  startResize,
  totalQty,
  totalAmount,
  onBarcodeClick,
}: AddSaleTableProps) {
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Resize handle between columns
  const ResizeHandle = ({ col }: { col: number }) => (
    <div
      onMouseDown={(e) => startResize(col, e)}
      style={{
        position: "absolute", right: 0, top: 0,
        width: 6, height: "100%", cursor: "col-resize",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div style={{ width: 1, height: "60%", background: "#d1d5db" }} />
    </div>
  );

  return (
    <div style={{ background: "#fff", paddingBottom: 80 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: widths[0] }} />
          <col style={{ width: widths[1] }} />
          <col style={{ width: widths[2] }} />
          <col style={{ width: widths[3] }} />
          <col style={{ width: widths[4] }} />
          <col style={{ width: widths[5] }} />
          <col style={{ width: 36 }} />
        </colgroup>
        <thead>
          <tr style={{ background: "#f3f6f9", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
            {/* Barcode Icon */}
            <th style={{ position: "relative", padding: "5px 6px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              <div
                onClick={onBarcodeClick}
                style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #374151",
                borderRadius: 5,
                padding: "3px 4px",
                background: "#fff",
                cursor: "pointer",
              }}
                title="Barcode Scanner"
              >
                {/* Barcode SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left bracket */}
                  <path d="M2 5.5V4a1 1 0 011-1h2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 18.5V20a1 1 0 001 1h2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Right bracket */}
                  <path d="M22 5.5V4a1 1 0 00-1-1h-2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 18.5V20a1 1 0 01-1 1h-2" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Barcode lines */}
                  <line x1="6" y1="7" x2="6" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="8.5" y1="7" x2="8.5" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="11" y1="7" x2="11" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="13" y1="7" x2="13" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="15.5" y1="7" x2="15.5" y2="17" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="7" x2="18" y2="17" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <ResizeHandle col={0} />
            </th>
            {/* ITEM */}
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              ITEM<ResizeHandle col={1} />
            </th>
            {/* QTY */}
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              QTY<ResizeHandle col={2} />
            </th>
            {/* UNIT */}
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              UNIT<ResizeHandle col={3} />
            </th>
            {/* PRICE/UNIT */}
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              PRICE/UNIT<ResizeHandle col={4} />
            </th>
            {/* AMOUNT */}
            <th style={{ position: "relative", padding: "8px 10px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              AMOUNT<ResizeHandle col={5} />
            </th>
            {/* + col */}
            <th style={{ padding: "8px 6px", textAlign: "center", background: "#f3f6f9" }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: 0, display: "flex", alignItems: "center" }}>
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {activeTab.rows.map((row, idx) => {
            const amount = (parseFloat(row.qty) || 0) * (parseFloat(row.pricePerUnit) || 0);
            return (
              <tr key={row.id} style={{ borderBottom: "1px solid #f0f0f0" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                {/* # */}
                <td style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "5px 0", borderRight: "1px solid #e5e7eb" }}>
                  {idx + 1}
                </td>
                {/* ITEM */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <select
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", appearance: "none", cursor: "pointer" }}
                    value={row.itemId}
                    onChange={(e) => updateRowItem(row.id, e.target.value)}
                  >
                    <option value="">Select Item</option>
                    {items.filter(item => item.status !== 'inactive' || item.id === row.itemId).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </td>
                {/* QTY */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.qty}
                    onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                  />
                </td>
                {/* UNIT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {(() => {
                      const matchedItem = items.find((item) => item.id === row.itemId);
                      let currentUnitOptions = ["NONE"];

                      if (matchedItem) {
                        currentUnitOptions = [];
                        if (matchedItem.primary_unit) currentUnitOptions.push(matchedItem.primary_unit);
                        else if (matchedItem.unit && matchedItem.unit !== "NONE") currentUnitOptions.push(matchedItem.unit);

                        if (matchedItem.secondary_unit) currentUnitOptions.push(matchedItem.secondary_unit);

                        if (currentUnitOptions.length === 0) currentUnitOptions = ["NONE"];
                      }

                      const isDisabled = !row.itemId;

                      return (
                        <select
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: 13,
                            color: isDisabled ? "#9ca3af" : "#374151",
                            background: "transparent",
                            appearance: "none",
                            cursor: isDisabled ? "not-allowed" : "pointer"
                          }}
                          value={row.unit}
                          onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                          disabled={isDisabled}
                        >
                          {currentUnitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      );
                    })()}
                    <span style={{ color: "#9ca3af", fontSize: 10, pointerEvents: "none" }}>▼</span>
                  </div>
                </td>

                {/* PRICE/UNIT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 8px" }}>
                  <input type="number"
                    style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", textAlign: "right" }}
                    value={row.pricePerUnit}
                    onChange={(e) => updateRow(row.id, "pricePerUnit", e.target.value)}
                  />
                </td>
                {/* AMOUNT */}
                <td style={{ borderRight: "1px solid #e5e7eb", padding: "4px 10px", textAlign: "right", fontSize: 13, color: "#374151" }}>
                  {amount > 0 ? fmt(amount) : ""}
                </td>
                <td />
              </tr>
            );
          })}

          {/* TOTAL ROW */}
          <tr style={{ borderTop: "2px solid #e5e7eb", background: "#fafafa" }}>
            <td style={{ borderRight: "1px solid #e5e7eb" }} />
            <td style={{ padding: "8px 8px", borderRight: "1px solid #e5e7eb" }}>
              <button
                onClick={addRow}
                style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", border: "1px solid #93c5fd", borderRadius: 4, padding: "3px 10px", background: "#fff", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                ADD ROW
              </button>
            </td>
            <td colSpan={2} style={{ padding: "8px 10px", fontSize: 12, fontWeight: 700, color: "#6b7280", borderRight: "1px solid #e5e7eb", letterSpacing: "0.04em" }}>
              <span style={{ float: "left" }}>TOTAL</span>
              <span style={{ float: "right" }}>{totalQty > 0 ? totalQty : 0}</span>
            </td>

            <td style={{ borderRight: "1px solid #e5e7eb" }} />
            <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#374151", borderRight: "1px solid #e5e7eb" }}>
              {totalAmount > 0 ? fmt(totalAmount) : "0"}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
