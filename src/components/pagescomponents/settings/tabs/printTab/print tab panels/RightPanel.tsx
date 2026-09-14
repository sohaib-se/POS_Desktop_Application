import { useState, useEffect, useRef } from "react";
import { getPrintTotalsSettings, setPrintTotalsSettings } from "@/hooks/usePrintSettings";
import { PhoneInput } from "@/components/ui/phone-input";

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
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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

/* ─────────────────────── Logo upload row ──────────────────────────── */

function LogoUploadRow({
  logoUrl,
  onLogoChange,
}: {
  logoUrl: string;
  onLogoChange: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Company Logo</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Preview */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", lineHeight: 1.3 }}>
              No<br />Logo
            </span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <button
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              fontSize: 11,
              color: hovered ? "#111827" : "#374151",
              border: "1px solid " + (hovered ? "#9ca3af" : "#e5e7eb"),
              borderRadius: 5,
              padding: "4px 10px",
              background: hovered ? "#f3f4f6" : "#fff",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {logoUrl ? "Change Logo" : "Upload Logo"}
          </button>
          {logoUrl && (
            <button
              onClick={() => onLogoChange("")}
              style={{
                fontSize: 11,
                color: "#ef4444",
                border: "1px solid #fecaca",
                borderRadius: 5,
                padding: "4px 10px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

/* ─────────────────── Phone input row (inline style version) ─────────── */

function PhoneRow({
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
      {/* Reuse the exact same PhoneInput as EditProfile — it handles country code + number */}
      <PhoneInput value={value} onChange={onChange} />
    </div>
  );
}

/* ─────────────────── Save status banner ─────────────────────────────── */

function SaveBanner({ status }: { status: "saving" | "saved" | "error" | null }) {
  if (!status) return null;
  const colors = {
    saving: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    saved: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
    error: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  };
  const labels = { saving: "Saving…", saved: "✓ Saved", error: "Save failed" };
  const c = colors[status];
  return (
    <div
      style={{
        margin: "8px 14px 0",
        padding: "6px 10px",
        borderRadius: 5,
        border: `1px solid ${c.border}`,
        background: c.bg,
        fontSize: 11.5,
        fontWeight: 600,
        color: c.text,
      }}
    >
      {labels[status]}
    </div>
  );
}

/* ──────────────────────── Settings state ────────────────────────────── */

interface PrintSettings {
  // Header — loaded from profile
  makeRegularDefault: boolean;
  printRepeatHeader: boolean;
  companyName: string;
  logoUrl: string;
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
  previousBalance: boolean;
  taxDetails: boolean;
  discount: boolean;
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
  companyName: "",
  logoUrl: "",
  address: "",
  email: "",
  phoneNumber: "",
  paperSize: "A4",
  companyNameTextSize: "medium",
  invoiceTextSize: "medium",
  itemTableCustomization: false,
  // Totals & Taxes — all enabled by default
  totalItemQuantity: true,
  amountWithDecimal: true,
  receivedAmount: true,
  balanceAmount: true,
  currentBalanceOfParty: true,
  previousBalance: true,
  taxDetails: true,
  discount: true,
  youSaved: true,
  printDescription: false,
  printTermsAndConditions: false,
  printReceivedBy: false,
  printSignatureText: "Authorized Signatory",
  paymentMode: false,
};

/* ─────────────────────────── RightPanel ────────────────────────────── */

export function RightPanel() {
  const [settings, setSettings] = useState<PrintSettings>(() => {
    // Merge persisted Totals & Taxes settings with the rest of the defaults
    const saved = getPrintTotalsSettings();
    return {
      ...DEFAULT_SETTINGS,
      totalItemQuantity: saved.totalItemQuantity,
      amountWithDecimal: saved.amountWithDecimal,
      receivedAmount: saved.receivedAmount,
      balanceAmount: saved.balanceAmount,
      currentBalanceOfParty: saved.currentBalanceOfParty,
      previousBalance: saved.previousBalance,
      taxDetails: saved.taxDetails,
      discount: saved.discount,
      youSaved: saved.youSaved,
    };
  });
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error" | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref in sync so the debounced callback can read the latest values
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  /* Load profile on mount */
  useEffect(() => {
    fetch("/api/user_profile")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setSettings((prev) => ({
            ...prev,
            companyName: d.business_name || "",
            logoUrl: d.logo_url || d.logo || "",
            address: d.address || "",
            email: d.email || "",
            phoneNumber: d.phone || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const TOTALS_KEYS = new Set([
    "totalItemQuantity", "amountWithDecimal", "receivedAmount",
    "balanceAmount", "currentBalanceOfParty", "previousBalance", "taxDetails", "discount", "youSaved",
  ] as const);

  const set = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Sync Totals & Taxes toggles to localStorage immediately
      if (TOTALS_KEYS.has(key as any)) {
        setPrintTotalsSettings({
          totalItemQuantity: next.totalItemQuantity,
          amountWithDecimal: next.amountWithDecimal,
          receivedAmount: next.receivedAmount,
          balanceAmount: next.balanceAmount,
          currentBalanceOfParty: next.currentBalanceOfParty,
          previousBalance: next.previousBalance,
          taxDetails: next.taxDetails,
          discount: next.discount,
          youSaved: next.youSaved,
        });
      }
      return next;
    });
  };

  /* ── Save profile fields to API (debounced 600ms) ── */
  const saveProfileField = (patch: Partial<{
    companyName: string;
    logo: string;
    address: string;
    email: string;
    phone: string;
  }>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const s = settingsRef.current;
        const res = await fetch("/api/user_profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: patch.companyName ?? s.companyName,
            phone: patch.phone ?? s.phoneNumber,
            email: patch.email ?? s.email,
            address: patch.address ?? s.address,
            logo: patch.logo !== undefined ? patch.logo : s.logoUrl,
          }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
        setTimeout(() => setSaveStatus(null), 2500);
      } catch {
        setSaveStatus("error");
      }
    }, 600);
  };

  /* Helpers that update local state AND trigger an API save */
  const handleCompanyName = (v: string) => {
    set("companyName", v);
    saveProfileField({ companyName: v });
  };
  const handleLogo = (v: string) => {
    set("logoUrl", v);
    saveProfileField({ logo: v });
  };
  const handleAddress = (v: string) => {
    set("address", v);
    saveProfileField({ address: v });
  };
  const handleEmail = (v: string) => {
    set("email", v);
    saveProfileField({ email: v });
  };
  const handlePhone = (v: string) => {
    set("phoneNumber", v);
    saveProfileField({ phone: v });
  };

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

      <SaveBanner status={saveStatus} />

      {/* ── Print Company Info / Header ── */}
      <SettingsSection title="Print Company Info / Header">
        <ToggleRow label="Make Regular Printer Default" checked={settings.makeRegularDefault} onChange={(v) => set("makeRegularDefault", v)} />
        <ToggleRow label="Print repeat header in all pages" checked={settings.printRepeatHeader} onChange={(v) => set("printRepeatHeader", v)} />

        {/* Company Name — synced to profile */}
        <InputRow
          label="Company Name"
          value={settings.companyName}
          onChange={handleCompanyName}
          placeholder="Enter company name"
        />

        {/* Logo upload with preview */}
        <LogoUploadRow logoUrl={settings.logoUrl} onLogoChange={handleLogo} />

        {/* Address */}
        <InputRow
          label="Address"
          value={settings.address}
          onChange={handleAddress}
          placeholder="Enter address"
        />

        {/* Email */}
        <InputRow
          label="Email"
          value={settings.email}
          onChange={handleEmail}
          type="email"
          placeholder="Enter email"
        />

        {/* Phone with country code — same PhoneInput as EditProfile */}
        <PhoneRow
          label="Phone Number"
          value={settings.phoneNumber}
          onChange={handlePhone}
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
        <ToggleRow label="Previous Balance" checked={settings.previousBalance} onChange={(v) => set("previousBalance", v)} />
        <ToggleRow label="Current Balance of Party" checked={settings.currentBalanceOfParty} onChange={(v) => set("currentBalanceOfParty", v)} />
        <ToggleRow label="Tax Details" checked={settings.taxDetails} onChange={(v) => set("taxDetails", v)} />
        <ToggleRow label="Discount" checked={settings.discount} onChange={(v) => set("discount", v)} />
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
