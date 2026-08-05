import { useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { Hint } from "../shared/SharedComponents";
import { cbStyle, labelMd, nudgeBtn } from "../shared/styles";

export function GeneralTab() {
  const [zoom, setZoom] = useState(100);
  const zoomStops = [70, 80, 90, 100, 110, 115, 120, 130];

  return (
    <div style={{ padding: "0" }}>
      {/* ── ROW 1: Application | Multi Firm | Backup & History ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Col 1 – Application */}
        <div style={{ padding: "22px 28px 20px" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Application
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 18,
            }}
          />

          {/* Enable Passcode – checkbox LEFT, label right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 18,
            }}
          >
            <input type="checkbox" style={cbStyle} />
            <span style={labelMd}>Enable Passcode</span>
            <Hint />
          </div>

          {/* Business Currency – label LEFT inline, value right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={labelMd}>
              Business Currency <Hint />
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#374151" }}>Rs</span>
              <ChevronDown size={13} color="#6b7280" />
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={labelMd}>Amount</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  (upto Decimal Places)
                </div>
                <Hint />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* spinner input */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="number"
                    defaultValue={2}
                    style={{
                      width: 36,
                      border: "none",
                      outline: "none",
                      fontSize: 13,
                      color: "#374151",
                      padding: "3px 6px",
                      textAlign: "center",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderLeft: "1px solid #d1d5db",
                      width: 16,
                    }}
                  >
                    <button style={nudgeBtn}>▲</button>
                    <button
                      style={{ ...nudgeBtn, borderTop: "1px solid #d1d5db" }}
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  e.g. 0.00
                </span>
              </div>
            </div>
          </div>

          {/* TIN Number */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 18,
            }}
          >
            <input type="checkbox" style={cbStyle} />
            <span style={{ ...labelMd, color: "#d97706" }}>TIN Number</span>
            <Hint />
          </div>

          {/* Stop Sale on Negative Stock */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 18,
            }}
          >
            <input type="checkbox" style={cbStyle} />
            <span style={labelMd}>Stop Sale on Negative Stock</span>
            <Hint />
          </div>

          {/* Block New Items */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 18,
            }}
          >
            <input type="checkbox" style={cbStyle} />
            <span style={labelMd}>Block New Items from Txn Form</span>
            <Hint />
          </div>

          {/* Block New Parties */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 0,
            }}
          >
            <input type="checkbox" style={cbStyle} />
            <span style={labelMd}>Block New Parties from Txn Form</span>
            <Hint />
          </div>
        </div>

        {/* Col 2 – Multi Firm */}
        <div
          style={{ padding: "22px 28px 20px", borderLeft: "1px solid #e5e7eb" }}
        >
          {/* Title row with checkbox on the right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                Multi Firm
              </span>
              {/* blue badge icon */}
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "#fff",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                M
              </span>
            </div>
            <input type="checkbox" style={cbStyle} />
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 18,
            }}
          />

          {/* Company row */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* filled radio */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid #2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#2563eb",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#111827",
                flex: 1,
              }}
            >
              My Company
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#6b7280",
                fontWeight: 600,
                background: "transparent",
                letterSpacing: "0.5px",
              }}
            >
              DEFAULT
            </span>
            <Pencil
              size={14}
              color="#2563eb"
              style={{ cursor: "pointer", marginLeft: 6 }}
            />
          </div>
        </div>

        {/* Col 3 – Backup & History */}
        <div
          style={{ padding: "22px 28px 20px", borderLeft: "1px solid #e5e7eb" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Backup &amp; History
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 18,
            }}
          />

          {/* Auto Backup row – label left, checkbox right */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 6,
              gap: 8,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={labelMd}>Auto Backup</span>
                <Hint />
              </div>
            </div>
            <input type="checkbox" style={cbStyle} />
          </div>
          {/* last backup amber text */}
          <div style={{ fontSize: 11, color: "#ca8a04", marginBottom: 18 }}>
            Last Backup 23/04/2026 | 10:04 PM <Hint />
          </div>

          {/* Transaction History – checkbox left */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input type="checkbox" defaultChecked style={cbStyle} />
            <span style={labelMd}>Transaction History</span>
            <Hint />
          </div>
        </div>
      </div>

      {/* ── ROW 2: More Transactions | Stock Transfer | Customize View ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {/* More Transactions */}
        <div style={{ padding: "22px 28px 24px" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            More Transactions
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 16,
            }}
          />

          {[
            { label: "Estimate/Quotation", checked: true },
            { label: "Proforma Invoice", checked: true },
            { label: "Sale/Purchase Order", checked: true },
            { label: "Other Income", checked: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 16,
              }}
            >
              <input
                type="checkbox"
                defaultChecked={item.checked}
                style={cbStyle}
              />
              <span
                style={{
                  ...labelMd,
                  color: item.checked ? "#2563eb" : "#374151",
                }}
              >
                {item.label}
              </span>
              <Hint />
            </div>
          ))}
        </div>

        {/* Stock Transfer Between Stores */}
        <div
          style={{ padding: "22px 28px 24px", borderLeft: "1px solid #e5e7eb" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Stock Transfer Between Stores
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 12,
            }}
          />
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            Manage all your stores/godowns and transfer stock seamlessly between
            them. Using this feature, you can transfer stock between
            stores/godowns and manage your inventory more efficiently.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input type="checkbox" style={cbStyle} />
            <span style={labelMd}>Store management &amp; Stock transfer</span>
            <Hint />
            {/* video icon placeholders */}
            <span
              style={{
                width: 18,
                height: 14,
                background: "#ef4444",
                borderRadius: 3,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 8, color: "#fff" }}>▶</span>
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
                fontSize: 9,
                color: "#fff",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              M
            </span>
          </div>
        </div>

        {/* Customize Your View */}
        <div
          style={{ padding: "22px 28px 24px", borderLeft: "1px solid #e5e7eb" }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Customize Your View
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 12,
            }}
          />
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#d97706",
              marginBottom: 6,
            }}
          >
            Choose Your Screen Zoom/Scale
          </div>
          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            You can use this setting to resize the Vyapar screen, making it
            larger or smaller to fit your preferences.
          </p>
          {/* Slider track */}
          <div style={{ position: "relative", marginBottom: 4 }}>
            <input
              type="range"
              min={70}
              max={130}
              step={5}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#2563eb",
                cursor: "pointer",
                height: 4,
              }}
            />
          </div>
          {/* Zoom labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#9ca3af",
              marginBottom: 12,
            }}
          >
            {zoomStops.map((s) => (
              <span
                key={s}
                style={{
                  color: s === zoom ? "#2563eb" : "#9ca3af",
                  fontWeight: s === zoom ? 600 : 400,
                }}
              >
                {s}%
              </span>
            ))}
          </div>
          {/* Apply button */}
          <button
            style={{
              background: "#fff",
              color: "#2563eb",
              border: "1px solid #2563eb",
              borderRadius: 5,
              padding: "5px 20px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              float: "right",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
