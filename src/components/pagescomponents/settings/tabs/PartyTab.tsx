import { Card, SettingToggleRow, Hint } from "../shared/SharedComponents";
import { inputStyle, nudgeBtn } from "../shared/styles";

export function PartyTab() {
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
        
        {/* Party Settings Card */}
        <Card title="Party Settings">
          <SettingToggleRow label="Shipping Address" hint={true} />
          <SettingToggleRow label="Enable Payment Reminder" hint={true} defaultChecked={true} />
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              flexWrap: "wrap",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                Remind me for payment due in
              </span>
              <Hint />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff"
                }}
              >
                <input
                  type="number"
                  defaultValue={1}
                  style={{
                    ...inputStyle,
                    width: "44px",
                    border: "none",
                    borderRadius: 0,
                    textAlign: "center",
                    fontWeight: 600,
                    padding: "4px"
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: "1px solid #cbd5e1",
                    background: "#f8fafc"
                  }}
                >
                  <button style={{ ...nudgeBtn, padding: "2px 6px" }}>▲</button>
                  <button style={{ ...nudgeBtn, padding: "2px 6px", borderTop: "1px solid #cbd5e1" }}>
                    ▼
                  </button>
                </div>
              </div>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>(days)</span>
            </div>
          </div>
          
          <button
            style={{
              border: "1px solid #3b82f6",
              background: "#fff",
              color: "#3b82f6",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              alignSelf: "flex-start",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            Reminder Message &gt;
          </button>
        </Card>

      </div>
    </div>
  );
}
