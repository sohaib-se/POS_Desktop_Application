import { useEffect, useState } from "react";
import {
  Settings,
  Printer,
  MessageSquare,
  Users,
  Package,
  X,
  ArrowLeftRight,
  Search,
  Pencil,
  Info,
  ChevronDown,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SettingsPageProps {
  onClose?: () => void;
}

const tabs = [
  { id: "general", label: "GENERAL", icon: Settings },
  { id: "transaction", label: "TRANSACTION", icon: ArrowLeftRight },
  { id: "print", label: "PRINT", icon: Printer },
  { id: "message", label: "TRANSACTION MESSAGE", icon: MessageSquare },
  { id: "party", label: "PARTY", icon: Users },
  { id: "item", label: "ITEM", icon: Package },
];

export function SettingsPage({ onClose }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState("general");
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [isOpenAnimated, setIsOpenAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsOpenAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        opacity: isOpenAnimated ? 1 : 0,
        transform: isOpenAnimated
          ? "translate3d(0,0,0) scale(1)"
          : "translate3d(-48px,48px,0) scale(0.99)",
        transition:
          "opacity 120ms ease-out, transform 170ms cubic-bezier(0.2,0.8,0.2,1)",
        background: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Dark sidebar ── */}
        <aside
          style={{
            width: 200,
            background: "#1e2433",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px 12px",
            }}
          >
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500 }}>
              Settings
            </span>
            <Search
              size={15}
              color="rgba(255,255,255,0.4)"
              style={{ cursor: "pointer" }}
            />
          </div>

          <nav style={{ flex: 1, overflowY: "auto" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "print") setShowPrintSettings(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 16px",
                    background: active
                      ? "rgba(255,255,255,0.12)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.3px",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "transaction" && <TransactionTab />}
          {activeTab === "message" && <TransactionMessageTab />}
          {activeTab === "party" && <PartyTab />}
          {activeTab === "item" && <ItemTab />}
        </main>
      </div>

      {/* Print modal */}
      <Dialog open={showPrintSettings} onOpenChange={setShowPrintSettings}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Settings</DialogTitle>
          </DialogHeader>
          <PrintSettings />
        </DialogContent>
      </Dialog>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close settings"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 28,
            height: 28,
            background: "#4b5563",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHARED PRIMITIVES
═══════════════════════════════════════════════ */

function Hint() {
  return (
    <Info
      size={12}
      style={{
        display: "inline",
        verticalAlign: "middle",
        color: "#9ca3af",
        marginLeft: 3,
        flexShrink: 0,
      }}
    />
  );
}

/** Checkbox on the LEFT, label on the right */
function CheckRow({
  label,
  hint = false,
  defaultChecked = false,
  checked,
  onChange,
  labelStyle,
  extra,
}: {
  label: React.ReactNode;
  hint?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  labelStyle?: React.CSSProperties;
  extra?: React.ReactNode;
}) {
  return (
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
        defaultChecked={checked !== undefined ? undefined : defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        style={{
          accentColor: "#2563eb",
          width: 15,
          height: 15,
          flexShrink: 0,
          cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 13, color: "#374151", ...labelStyle }}>
        {label}
        {hint && <Hint />}
      </span>
      {extra}
    </div>
  );
}

/** Toggle on the RIGHT, label on the left */
function ToggleRow({
  label,
  hint = false,
  defaultChecked = false,
  sub,
}: {
  label: string;
  hint?: boolean;
  defaultChecked?: boolean;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 8,
      }}
    >
      <div>
        <span style={{ fontSize: 13, color: "#374151" }}>
          {label}
          {hint && <Hint />}
        </span>
        {sub && (
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{
          accentColor: "#2563eb",
          width: 15,
          height: 15,
          flexShrink: 0,
          cursor: "pointer",
          marginTop: 2,
        }}
      />
    </div>
  );
}

const SH: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  marginBottom: 6,
};
const HR: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "0 0 18px",
};
const COL: React.CSSProperties = { padding: "24px 28px" };

/* ═══════════════════════════════════════════════
   GENERAL TAB  — matches screenshot exactly
═══════════════════════════════════════════════ */

function GeneralTab() {
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

/* shared micro-styles used only in GeneralTab */
const cbStyle: React.CSSProperties = {
  accentColor: "#2563eb",
  width: 15,
  height: 15,
  flexShrink: 0,
  cursor: "pointer",
};
const labelMd: React.CSSProperties = {
  fontSize: 13,
  color: "#374151",
};

/* ═══════════════════════════════════════════════
   TRANSACTION TAB  (Image 1)
═══════════════════════════════════════════════ */

function TransactionTab() {
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Col 1 – Transaction Header */}
        <div style={COL}>
          <div style={SH}>Transaction Header</div>
          <hr style={HR} />
          <CheckRow label="Invoice/Bill No." hint defaultChecked />
          <CheckRow label="Add Time on Transactions" hint />
          <CheckRow label="Cash Sale by default" hint />
          <CheckRow label="Billing Name of Parties" hint />
          <CheckRow label="Customers P.O. Details on Transactions" hint />
        </div>

        {/* Col 2 – Items Table */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Items Table</div>
          <hr style={HR} />
          <CheckRow
            label="Inclusive/Exclusive Tax on Rate(Price/Unit)"
            hint
            defaultChecked
          />
          <CheckRow
            label="Display Purchase Price of Items"
            hint
            defaultChecked
          />
          <CheckRow label="Show last 5 Sale Price of Items" hint />
          <CheckRow label="Show last 5 Purchase Price of Items" hint />
          <CheckRow label="Free Item Quantity" hint />
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
            <span style={{ fontSize: 13, color: "#374151" }}>Count</span>
            <span style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>
              Change Text
            </span>
            <Hint />
          </div>
        </div>

        {/* Col 3 – Taxes, Discount & Totals */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Taxes, Discount &amp; Totals</div>
          <hr style={HR} />
          <CheckRow label="Transaction wise Tax" hint defaultChecked />
          <CheckRow label="Transaction wise Discount" hint defaultChecked />
          <CheckRow label="Round Off Total" hint defaultChecked />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
              marginTop: 4,
            }}
          >
            <select style={selStyle}>
              <option>Nearest</option>
              <option>Round Up</option>
              <option>Round Down</option>
            </select>
            <span style={{ fontSize: 13, color: "#374151" }}>To</span>
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
                  width: 50,
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
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {/* More Transaction Features */}
        <div style={COL}>
          <div style={SH}>More Transaction Features</div>
          <hr style={HR} />
          <CheckRow label="Quick Entry" hint />
          <CheckRow label="Do not Show Invoice Preview" hint />
          <CheckRow
            label={
              <span>
                Enable <span style={{ color: "#2563eb" }}>Passcode</span> for{" "}
                <span style={{ color: "#2563eb" }}>transaction</span>{" "}
                edit/delete
              </span>
            }
            hint
          />
          <CheckRow label="Discount During Payments" hint />
          <CheckRow label="Link Payments to Invoices" hint />
          <CheckRow label="Due Dates and Payment Terms" hint />
        </div>

        {/* Transaction Prefixes */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Transaction Prefixes</div>
          <hr style={HR} />
          {/* Firm selector */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 16,
              position: "relative",
            }}
          >
            <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>
              Firm
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "#374151" }}>My Company</span>
              <ChevronDown size={14} color="#6b7280" />
            </div>
          </div>
          {/* Prefixes box */}
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
              Prefixes
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                ["Sale", "Credit Note"],
                ["Sale Order", "Purchase Order"],
                ["Estimate", "Proforma Invoice"],
                ["Delivery Challan", "Payment In"],
              ].map(([a, b]) => (
                <>
                  <PrefixField key={a} label={a} />
                  <PrefixField key={b} label={b} />
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Type */}
        <div style={{ ...COL, borderLeft: "1px solid #e5e7eb" }}>
          <div style={SH}>Billing Type</div>
          <hr style={HR} />
          <RadioRow label="Lite Sale" checked={false} />
          <RadioRow label="Full Sale" checked={true} />
        </div>
      </div>
    </div>
  );
}

function PrefixField({ label }: { label: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#2563eb", marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <select
          style={{
            flex: 1,
            border: "none",
            padding: "5px 8px",
            fontSize: 12,
            color: "#374151",
            outline: "none",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option>None</option>
        </select>
        <ChevronDown
          size={12}
          color="#6b7280"
          style={{ marginRight: 6, flexShrink: 0 }}
        />
      </div>
    </div>
  );
}

function RadioRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: checked ? "2px solid #2563eb" : "2px solid #9ca3af",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        {checked && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#2563eb",
            }}
          />
        )}
      </div>
      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TRANSACTION MESSAGE TAB  (Image 2)
═══════════════════════════════════════════════ */

function TransactionMessageTab() {
  const [txnType, setTxnType] = useState("Sales Transaction");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        height: "100%",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          padding: "24px 28px",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
        }}
      >
        <div style={SH}>Transaction Message</div>

        {/* Select message type */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 10 }}>
            Select Message Type:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 16px",
              }}
            >
              {/* WhatsApp icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.099 1.508 5.822L.057 23.7a.75.75 0 00.917.913l5.938-1.547A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.07-1.428l-.364-.213-3.773.983.997-3.68-.236-.378A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              <span style={{ fontSize: 13, color: "#374151" }}>
                Send via Personal WhatsApp
              </span>
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #2563eb",
                  color: "#2563eb",
                  borderRadius: 5,
                  padding: "3px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Message Recipient Settings */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            Message Recipient Settings:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <CheckRow label="Send Message to Party" hint defaultChecked />
            <CheckRow
              label="Send Transaction Update Message"
              hint
              extra={
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                      marginLeft: 4,
                    }}
                  />
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
                      marginLeft: 4,
                    }}
                  >
                    M
                  </span>
                </>
              }
            />
            <CheckRow
              label="Send Message Copy to Self"
              hint
              extra={
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
                    marginLeft: 4,
                  }}
                >
                  M
                </span>
              }
            />
          </div>
        </div>

        {/* Message Content */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Message Content:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <CheckRow label="Party Current Balance in Message" hint />
            <CheckRow label="Web invoice link in Message" hint defaultChecked />
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              margin: "14px 0 8px",
            }}
          >
            Send Automatic Message for:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
            }}
          >
            {[
              { label: "Sales", checked: true },
              { label: "Purchase", checked: true },
              { label: "Sales Return", checked: true },
              { label: "Purchase Return", checked: true },
              { label: "Payment In", checked: true },
              { label: "Payment Out", checked: true },
              { label: "Sale Order", checked: true },
              { label: "Purchase Order", checked: false },
              { label: "Estimate", checked: false },
              { label: "Proforma Invoice", checked: false },
              { label: "Delivery Challan", checked: false },
              { label: "Cancelled Invoice", checked: true },
            ].map((item) => (
              <CheckRow
                key={item.label}
                label={item.label}
                defaultChecked={item.checked}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – Edit Message */}
      <div
        style={{ padding: "24px 20px", background: "#fff", overflowY: "auto" }}
      >
        {/* Transaction type selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, color: "#374151" }}>
            Transaction Type :
          </span>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              color: "#374151",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {txnType} <ChevronDown size={13} />
          </button>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Edit Message
        </div>

        {/* Message editor */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <textarea
            defaultValue={
              "Thanks for your purchase with us!!\nPurchase Details:"
            }
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 12,
              color: "#374151",
              fontFamily: "inherit",
              minHeight: 60,
            }}
          />
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 10,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
              Invoice Amount: 792
              <br />
              Received: 300
              <br />
              Balance: 492
              <br />
              Total Balance: 800
            </div>
          </div>
          {/* Footer */}
          <div
            style={{
              borderTop: "1px dashed #d1d5db",
              marginTop: 10,
              paddingTop: 8,
            }}
          >
            <input
              placeholder="Footer"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 12,
                color: "#9ca3af",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Message Preview */}
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Message Preview
        </div>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>
              Transaction Image Attached
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
            Thanks for your purchase with us!!
            <br />
            Purchase Details:
            <br />
            Invoice Amount: 792
            <br />
            Received: 300
            <br />
            Balance: 492
            <br />
            Total Balance: 800
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PARTY TAB  (Image 3)
═══════════════════════════════════════════════ */

function PartyTab() {
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

function AdditionalFieldRow({ placeholder }: { placeholder: string }) {
  return (
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
        <input placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <ToggleField />
    </div>
  );
}

function ToggleField() {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 23 }}
    >
      {/* pill toggle OFF */}
      <div
        style={{
          width: 34,
          height: 18,
          borderRadius: 9,
          background: "#d1d5db",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>Show In Print</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ITEM TAB  (Image 4)
═══════════════════════════════════════════════ */

function ItemTab() {
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

/* ═══════════════════════════════════════════════
   PRINT SETTINGS (modal)
═══════════════════════════════════════════════ */

function PrintSettings() {
  const [activePrinter, setActivePrinter] = useState<"regular" | "thermal">(
    "regular",
  );
  const [activeTab, setActiveTab] = useState<"layout" | "colors">("layout");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 16,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 20,
        }}
      >
        {(["regular", "thermal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setActivePrinter(p)}
            style={{
              paddingBottom: 8,
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderBottom:
                activePrinter === p
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
              color: activePrinter === p ? "#2563eb" : "#6b7280",
            }}
          >
            {p === "regular" ? "REGULAR PRINTER" : "THERMAL PRINTER"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["layout", "colors"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              background: activeTab === t ? "#dbeafe" : "transparent",
              color: activeTab === t ? "#1d4ed8" : "#6b7280",
            }}
          >
            {t === "layout" ? "CHANGE LAYOUT" : "CHANGE COLORS"}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          {activeTab === "layout" && (
            <>
              <CheckRow label="Total Item Quantity" defaultChecked />
              <CheckRow label="Amount with Decimal e.g. 0.00" defaultChecked />
              <CheckRow label="Received Amount" />
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 16,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Print Company Info / Header
                </div>
                <CheckRow label="Make Regular Printer Default" defaultChecked />
                <CheckRow label="Print entry header on all pages" />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
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
                    Company Logo
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#2563eb",
                      cursor: "pointer",
                    }}
                  >
                    (Change)
                  </span>
                </div>
                <CheckRow
                  label="Print repeat header in all pages"
                  defaultChecked
                />
              </div>
            </>
          )}
          {activeTab === "colors" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
              }}
            >
              {[
                { name: "Tax Theme 6", bg: "#8b5cf6" },
                { name: "Double Divine", bg: "#374151" },
                { name: "French Elite", bg: "#d97706" },
                { name: "Theme 1", bg: "#2563eb" },
              ].map((theme) => (
                <button
                  key={theme.name}
                  style={{
                    padding: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 48,
                      background: theme.bg,
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            background: "#f9fafb",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 8, padding: 20 }}>
            <div
              style={{
                background: "#2563eb",
                color: "#fff",
                textAlign: "center",
                padding: "6px 0",
                marginBottom: 12,
                borderRadius: 4,
              }}
            >
              <strong style={{ fontSize: 12 }}>TAX INVOICE</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 10 }}>
                <strong>Laimsoft</strong>
                <div style={{ color: "#6b7280" }}>Phone: 3198224949</div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#e5e7eb",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#6b7280",
                }}
              >
                A
              </div>
            </div>
            <table
              style={{
                width: "100%",
                fontSize: 10,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#2563eb", color: "#fff" }}>
                  {["#", "Item name", "Qty", "Price/unit", "Amount"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "3px 5px",
                          textAlign: "left",
                          fontWeight: 500,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "3px 5px" }}>1</td>
                  <td style={{ padding: "3px 5px" }}>Sample Item</td>
                  <td style={{ padding: "3px 5px" }}>2</td>
                  <td style={{ padding: "3px 5px" }}>Rs 1,568.00</td>
                  <td style={{ padding: "3px 5px" }}>Rs 3,136.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SHARED STYLE TOKENS
═══════════════════════════════════════════════ */

const selStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 5,
  padding: "5px 8px",
  fontSize: 12,
  color: "#374151",
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 5,
  padding: "5px 8px",
  fontSize: 12,
  color: "#374151",
  outline: "none",
  background: "#fff",
};

const nudgeBtn: React.CSSProperties = {
  border: "none",
  background: "#f9fafb",
  cursor: "pointer",
  padding: "1px 5px",
  fontSize: 8,
  color: "#6b7280",
  lineHeight: 1.4,
};
