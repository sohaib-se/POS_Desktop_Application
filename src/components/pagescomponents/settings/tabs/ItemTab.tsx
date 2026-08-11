import { Card, SettingToggleRow, Hint } from "../shared/SharedComponents";
import { selStyle, inputStyle } from "../shared/styles";

export function ItemTab() {
  return (
    <div style={{ 
      padding: "32px", 
      background: "#f8fafc", 
      minHeight: "100%",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "24px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        
        {/* Item Settings Card */}
        <Card title="Item Settings">
          <SettingToggleRow label="Enable Item" hint={true} defaultChecked={true} />
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                What do you sell?
              </span>
              <Hint />
            </div>
            <select style={{ ...selStyle, padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", fontSize: "13px", color: "#334155" }}>
              <option>Product/Service</option>
              <option>Product</option>
              <option>Service</option>
            </select>
          </div>

          <SettingToggleRow label="Barcode Scan" hint={true} />
          <SettingToggleRow label="Show Low Stock Dialog" hint={true} defaultChecked={true} />
        </Card>

        {/* Additional Item Fields Card */}
        <Card title="Additional Item Fields">
          {[
            {
              label: "Exp Date",
              dateVal: "mm/yy",
              placeholder: "Exp. Date",
            },
            {
              label: "Mfg Date",
              dateVal: "dd/mm/yy",
              placeholder: "Mfg. Date",
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  style={{
                    accentColor: "#3b82f6",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                  {row.label}
                </span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select style={{ ...selStyle, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#f8fafc", fontSize: "12px" }}>
                  <option>{row.dateVal}</option>
                </select>
                <input
                  placeholder={row.placeholder}
                  style={{ ...inputStyle, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "90px", fontSize: "13px" }}
                />
              </div>
            </div>
          ))}
        </Card>

      </div>
    </div>
  );
}
