import { useState } from "react";

/* ─────────────────────────── Shared primitives ──────────────────────── */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 2 }}>
      {/* Section header — clearly visible, blue-accented */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px 9px 12px",
          background: "linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)",
          borderLeft: "3px solid #3b82f6",
          borderTop: "1px solid #dbeafe",
          borderBottom: "1px solid #dbeafe",
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#1e3a5f",
            letterSpacing: 0.3,
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          {title}
        </span>
      </div>
      {/* Section body */}
      <div
        style={{
          padding: "8px 14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          borderLeft: "3px solid #dbeafe",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 28, cursor: "pointer" }}
      onClick={() => onChange(!checked)}
    >
      <span style={{ fontSize: 12, color: "#374151", userSelect: "none" }}>{label}</span>
      <div
        style={{
          width: 34,
          height: 18,
          borderRadius: 9,
          background: checked ? "#3b82f6" : "#e5e7eb",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}

function InputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 5,
          padding: "5px 8px",
          fontSize: 12,
          color: "#374151",
          background: "#fff",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 5,
          padding: "5px 8px",
          fontSize: 12,
          color: "#374151",
          background: "#fff",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LinkRow({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
        cursor: "pointer",
        borderRadius: 4,
        transition: "background 0.1s",
        background: hovered ? "#f3f4f6" : "transparent",
        margin: "0 -4px",
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      <span style={{ fontSize: 12, color: hovered ? "#1e40af" : "#374151" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#9ca3af" }}>›</span>
    </div>
  );
}

function NumberInputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 28 }}>
      <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: 56,
          border: "1px solid #e5e7eb",
          borderRadius: 5,
          padding: "4px 6px",
          fontSize: 12,
          color: "#374151",
          background: "#fff",
          outline: "none",
          textAlign: "center",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 12,
        color: hovered ? "#111827" : "#374151",
        border: "1px solid " + (hovered ? "#9ca3af" : "#e5e7eb"),
        borderRadius: 5,
        padding: "5px 10px",
        background: hovered ? "#f3f4f6" : "#fff",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function LogoRow({ onChange }: { onChange?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 28 }}>
      <span style={{ fontSize: 12, color: "#374151" }}>Company Logo</span>
      <button
        onClick={onChange}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontSize: 11,
          color: hovered ? "#111827" : "#374151",
          border: "1px solid " + (hovered ? "#9ca3af" : "#e5e7eb"),
          borderRadius: 5,
          padding: "3px 10px",
          background: hovered ? "#f3f4f6" : "#fff",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Change
      </button>
    </div>
  );
}

/* ──────────────────────── Settings state ────────────────────────────── */

interface PrintSettings {
  // Header
  makeRegularDefault: boolean;
  printRepeatHeader: boolean;
  companyName: string;
  address: string;
  email: string;
  phoneNumber: string;
  // Paper
  paperSize: string;
  companyNameTextSize: string;
  invoiceTextSize: string;
  // Item table
  itemTableCustomization: boolean;
  // Totals & Taxes
  totalItemQuantity: boolean;
  amountWithDecimal: boolean;
  receivedAmount: boolean;
  balanceAmount: boolean;
  currentBalanceOfParty: boolean;
  taxDetails: boolean;
  youSaved: boolean;
  // Footer
  printDescription: boolean;
  printTermsAndConditions: boolean;
  printReceivedBy: boolean;
  printSignatureText: string;
  paymentMode: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
  makeRegularDefault: false,
  printRepeatHeader: false,
  companyName: "jkhkhkj",
  address: "",
  email: "",
  phoneNumber: "3369322038",
  paperSize: "A4",
  companyNameTextSize: "medium",
  invoiceTextSize: "medium",
  itemTableCustomization: false,
  totalItemQuantity: false,
  amountWithDecimal: false,
  receivedAmount: false,
  balanceAmount: false,
  currentBalanceOfParty: false,
  taxDetails: false,
  youSaved: false,
  printDescription: false,
  printTermsAndConditions: false,
  printReceivedBy: false,
  printSignatureText: "Authorized Signatory",
  paymentMode: false,
};

/* ─────────────────────────── RightPanel ────────────────────────────── */

export function RightPanel() {
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);

  const set = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Panel title */}
      <div
        style={{
          padding: "14px 14px 10px",
          fontSize: 13,
          fontWeight: 700,
          color: "#111827",
          letterSpacing: 0.1,
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        Preview Settings
      </div>

      {/* ── Print Company Info / Header ── */}
      <SettingsSection title="Print Company Info / Header">
        <ToggleRow label="Make Regular Printer Default" checked={settings.makeRegularDefault} onChange={(v) => set("makeRegularDefault", v)} />
        <ToggleRow label="Print repeat header in all pages" checked={settings.printRepeatHeader} onChange={(v) => set("printRepeatHeader", v)} />
        <InputRow label="Company Name" value={settings.companyName} onChange={(v) => set("companyName", v)} />
        <LogoRow />
        <InputRow label="Address" value={settings.address} onChange={(v) => set("address", v)} />
        <InputRow label="Email" value={settings.email} onChange={(v) => set("email", v)} />
        <InputRow label="Phone Number" value={settings.phoneNumber} onChange={(v) => set("phoneNumber", v)} />
      </SettingsSection>

      {/* ── Paper ── */}
      <SettingsSection title="Paper">
        <SelectRow
          label="Paper Size"
          value={settings.paperSize}
          options={[
            { label: "A4", value: "A4" },
            { label: "A5", value: "A5" },
            { label: "Letter", value: "Letter" },
            { label: "58mm", value: "58mm" },
            { label: "80mm", value: "80mm" },
          ]}
          onChange={(v) => set("paperSize", v)}
        />
        <SelectRow
          label="Company Name Text Size"
          value={settings.companyNameTextSize}
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          onChange={(v) => set("companyNameTextSize", v)}
        />
        <SelectRow
          label="Invoice Text Size"
          value={settings.invoiceTextSize}
          options={[
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ]}
          onChange={(v) => set("invoiceTextSize", v)}
        />
      </SettingsSection>

      {/* ── Item Table ── */}
      <SettingsSection title="Item Table">
        <LinkRow label="Item Table Customization ›" />
      </SettingsSection>

      {/* ── Totals & Taxes ── */}
      <SettingsSection title="Totals & Taxes">
        <ToggleRow label="Total Item Quantity" checked={settings.totalItemQuantity} onChange={(v) => set("totalItemQuantity", v)} />
        <ToggleRow label="Amount with Decimal e.g. 0.00" checked={settings.amountWithDecimal} onChange={(v) => set("amountWithDecimal", v)} />
        <ToggleRow label="Received Amount" checked={settings.receivedAmount} onChange={(v) => set("receivedAmount", v)} />
        <ToggleRow label="Balance Amount" checked={settings.balanceAmount} onChange={(v) => set("balanceAmount", v)} />
        <ToggleRow label="Current Balance of Party" checked={settings.currentBalanceOfParty} onChange={(v) => set("currentBalanceOfParty", v)} />
        <ToggleRow label="Tax Details" checked={settings.taxDetails} onChange={(v) => set("taxDetails", v)} />
        <ToggleRow label="You Saved" checked={settings.youSaved} onChange={(v) => set("youSaved", v)} />
      </SettingsSection>

      {/* ── Footer ── */}
      <SettingsSection title="Footer">
        <ToggleRow label="Print Description" checked={settings.printDescription} onChange={(v) => set("printDescription", v)} />
        <ToggleRow label="Print Terms and Conditions" checked={settings.printTermsAndConditions} onChange={(v) => set("printTermsAndConditions", v)} />
        <ToggleRow label="Print Received by details" checked={settings.printReceivedBy} onChange={(v) => set("printReceivedBy", v)} />
        <InputRow label="Print Signature Text" value={settings.printSignatureText} onChange={(v) => set("printSignatureText", v)} />
        <ActionButton label="Change Signature" />
        <ToggleRow label="Payment Mode" checked={settings.paymentMode} onChange={(v) => set("paymentMode", v)} />
      </SettingsSection>
    </div>
  );
}
