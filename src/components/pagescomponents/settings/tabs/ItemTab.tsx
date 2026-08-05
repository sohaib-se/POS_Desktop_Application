import { ChevronDown, Lock } from "lucide-react";
import { CheckRow, Hint } from "../shared/SharedComponents";
import { COL, SH, HR, selStyle, inputStyle } from "../shared/styles";

export function ItemTab() {
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Item Settings */}
        <div style={COL}>
          <div style={SH}>Item Settings</div>
          <hr style={HR} />
          <CheckRow label="Enable Item" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, color: "#374151" }}>
              What do you sell?
            </span>
            <Hint />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                padding: "4px 10px",
                cursor: "pointer",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, color: "#374151" }}>
                Product/Service
              </span>
              <ChevronDown size={13} color="#6b7280" />
            </div>
          </div>
          <CheckRow label="Barcode Scan" hint />
          <CheckRow label="Stock Maintenance" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
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
            <span style={{ fontSize: 13, color: "#374151" }}>
              Manufacturing <Hint />
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              <Lock size={11} /> Locked
            </span>
          </div>
          <CheckRow label="Show Low Stock Dialog" hint defaultChecked />
          <CheckRow label="Items Unit" hint defaultChecked />
          <CheckRow label="Default Unit" hint />
          <CheckRow label="Item Category" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
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
            <span style={{ fontSize: 13, color: "#374151" }}>
              Party Wise Item Rate <Hint />
            </span>
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
              }}
            >
              M
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
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
            <span style={{ fontSize: 13, color: "#374151" }}>Description</span>
            <span style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>
              Change Text
            </span>
            <Hint />
          </div>
          <CheckRow label="Item wise Tax" hint />
          <CheckRow label="Item wise Discount" hint />
        </div>

        {/* Additional Item Fields */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={SH}>Additional Item Fields</span>
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
              }}
            >
              M
            </span>
          </div>
          <hr style={HR} />

          {/* MRP/Price */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 10,
            }}
          >
            MRP/Price
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
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
            <span style={{ fontSize: 13, color: "#374151" }}>
              MRP <Hint />
            </span>
            <input placeholder="MRP" style={{ ...inputStyle, flex: 1 }} />
          </div>

          {/* Serial No. */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Serial No. Tracking <Hint />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
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
            <span style={{ fontSize: 13, color: "#374151" }}>
              Serial No./ IMEI No. etc
            </span>
            <input
              placeholder="Serial No."
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>

          {/* Batch Tracking */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Batch Tracking <Hint />
          </div>
          {[
            { label: "Batch No.", hasDate: false, placeholder: "Batch No." },
            {
              label: "Exp Date",
              hasDate: true,
              dateVal: "mm/yy",
              placeholder: "Exp. Date",
              checked: true,
            },
            {
              label: "Mfg Date",
              hasDate: true,
              dateVal: "dd/mm/yy",
              placeholder: "Mfg. Date",
              checked: true,
            },
            { label: "Model No.", hasDate: false, placeholder: "Model No." },
            {
              label: "Size",
              hasDate: false,
              placeholder: "Size",
              checked: true,
            },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                defaultChecked={row.checked}
                style={{
                  accentColor: "#2563eb",
                  width: 15,
                  height: 15,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#374151", minWidth: 68 }}>
                {row.label}
              </span>
              {row.hasDate && (
                <select
                  style={{ ...selStyle, fontSize: 11, padding: "3px 6px" }}
                >
                  <option>{row.dateVal}</option>
                </select>
              )}
              <input
                placeholder={row.placeholder}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          ))}
        </div>

        {/* Item Custom Fields */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={SH}>Item Custom Fields</span>
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
          <hr style={HR} />
          <button
            style={{
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              color: "#374151",
              borderRadius: 6,
              padding: "7px 16px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Add Custom Fields &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
