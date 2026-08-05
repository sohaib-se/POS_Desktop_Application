import { CheckRow, Hint, AdditionalFieldRow, ToggleField } from "../shared/SharedComponents";
import { COL, SH, HR, selStyle, inputStyle, nudgeBtn } from "../shared/styles";

export function PartyTab() {
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Party Settings */}
        <div style={COL}>
          <div style={SH}>Party Settings</div>
          <hr style={HR} />
          <CheckRow label="Party Grouping" hint />
          <CheckRow label="Shipping Address" hint />
          <CheckRow label="Manage Party Status" hint />
          <CheckRow label="Enable Payment Reminder" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, color: "#374151" }}>
              Remind me for payment due in
            </span>
            <Hint />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                overflow: "hidden",
              }}
            >
              <input
                type="number"
                defaultValue={1}
                style={{
                  ...inputStyle,
                  width: 44,
                  border: "none",
                  borderRadius: 0,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: "1px solid #d1d5db",
                }}
              >
                <button style={nudgeBtn}>▲</button>
                <button style={{ ...nudgeBtn, borderTop: "1px solid #d1d5db" }}>
                  ▼
                </button>
              </div>
            </div>
            <span style={{ fontSize: 13, color: "#374151" }}>(days)</span>
          </div>
          <button
            style={{
              border: "1px solid #2563eb",
              background: "#fff",
              color: "#2563eb",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Reminder Message &gt;
          </button>
        </div>

        {/* Additional fields */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={SH}>Additional fields</span>
            <Hint />
          </div>
          <hr style={HR} />
          {[1, 2, 3].map((n) => (
            <AdditionalFieldRow key={n} placeholder={`Additional Field ${n}`} />
          ))}
          {/* Field 4 with date */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                type="checkbox"
                style={{
                  accentColor: "#2563eb",
                  width: 15,
                  height: 15,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <input
                placeholder="Additional Field 4"
                style={{ ...inputStyle, flex: 1 }}
              />
              <select style={{ ...selStyle, fontSize: 11 }}>
                <option>dd/mm/yy</option>
                <option>mm/dd/yy</option>
              </select>
            </div>
            <ToggleField />
          </div>
        </div>

        {/* Enable Loyalty Point */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Enable Loyalty Point</div>
          <hr style={HR} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              defaultChecked
              style={{
                accentColor: "#2563eb",
                width: 15,
                height: 15,
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: 13, color: "#374151" }}>
              Enable Loyalty Point
            </span>
            <Hint />
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                marginLeft: 2,
              }}
            >
              M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
