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

/* ─────────────────────── Signature upload row ───────────────────────── */

function SignatureUploadRow({
  signatureUrl,
  onSignatureChange,
}: {
  signatureUrl: string;
  onSignatureChange: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSignatureChange(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>Print Signature</span>
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
          {signatureUrl ? (
            <img
              src={signatureUrl}
              alt="Signature"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", lineHeight: 1.3 }}>
              No<br />Sig
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
            {signatureUrl ? "Change Signature" : "Upload Signature"}
          </button>
          {signatureUrl && (
            <button
              onClick={() => onSignatureChange("")}
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

/* ─────────────────── Save status banner removed in favor of toast ─────────────────────────────── */

/* ──────────────────────── Settings state ────────────────────────────── */

interface PrintSettings {
  // Header — loaded from profile
  makeRegularDefault: boolean;
  companyName: string;
  logoUrl: string;
  signatureUrl: string;
  address: string;
  email: string;
  phoneNumber: string;
  // Paper
  paperSize: string;
  companyNameTextSize: string;
  invoiceTextSize: string;
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
  amountInWords: boolean;
  printDescription: boolean;
  printTermsAndConditions: boolean;
  printSignatureText: string;
  paymentMode: boolean;
  // Internal removal flags (not persisted directly — handled via DELETE API)
  logoRemoved: boolean;
  signatureRemoved: boolean;
}

const DEFAULT_SETTINGS: PrintSettings = {
  makeRegularDefault: false,
  companyName: "",
  logoUrl: "",
  signatureUrl: "",
  address: "",
  email: "",
  phoneNumber: "",
  paperSize: "A4",
  companyNameTextSize: "medium",
  invoiceTextSize: "medium",
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
  amountInWords: true,
  printDescription: false,
  printTermsAndConditions: false,
  printSignatureText: "Authorized Signatory",
  paymentMode: false,
  logoRemoved: false,
  signatureRemoved: false,
};

export interface RightPanelProps {
  onSave?: () => void;
  onCancel?: () => void;
  hasUnsavedChanges?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function RightPanel({ onSave, onCancel, hasUnsavedChanges = false, onDirtyChange }: RightPanelProps = {}) {
  const [initialSettings, setInitialSettings] = useState<PrintSettings>(() => {
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
      amountInWords: saved.amountInWords,
      printDescription: saved.printDescription,
      printTermsAndConditions: saved.printTermsAndConditions,
      printSignatureText: saved.printSignatureText,
      paymentMode: saved.paymentMode,
    };
  });
  const [settings, setSettings] = useState<PrintSettings>(initialSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setIsDirty(dirty);
    onDirtyChange?.(dirty);

    // Dispatch draft settings to update the preview in real-time
    window.dispatchEvent(new CustomEvent("print-settings-draft", { detail: settings }));
    window.dispatchEvent(new CustomEvent("print-profile-draft", {
      detail: {
        business_name: settings.companyName,
        phone: settings.phoneNumber,
        logo_url: settings.logoUrl,
        address: settings.address,
        email: settings.email,
        signature: settings.signatureUrl,
      }
    }));
  }, [settings, initialSettings, onDirtyChange]);

  /* Load profile on mount */
  useEffect(() => {
    fetch("/api/user_profile")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          const profileData = {
            companyName: d.business_name || "",
            logoUrl: d.logo_url || d.logo || "",
            signatureUrl: d.signature_url || d.signature || "",
            address: d.address || "",
            email: d.email || "",
            phoneNumber: d.phone || "",
          };
          setInitialSettings((prev) => ({ ...prev, ...profileData }));
          setSettings((prev) => ({ ...prev, ...profileData }));
        }
      })
      .catch(() => {});
  }, []);

  const set = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Step 1: Handle explicit logo/signature removals via the dedicated DELETE endpoint
      // The regular PUT uses COALESCE so empty-string / null won't clear existing values.
      if (settings.logoRemoved) {
        await fetch("/api/delete_profile_image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "logo" }),
        });
      }
      if (settings.signatureRemoved) {
        await fetch("/api/delete_profile_image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "signature" }),
        });
      }

      // Step 2: Persist the rest of the profile fields
      const res = await fetch("/api/user_profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: settings.companyName,
          phone: settings.phoneNumber,
          email: settings.email,
          address: settings.address,
          // Only send logo/signature when they are NEW uploads (data URLs).
          // Removals are already handled above; sending empty string here would
          // be a no-op due to the COALESCE guard in the DB upsert.
          logo: settings.logoRemoved ? undefined : settings.logoUrl,
          signature: settings.signatureRemoved ? undefined : settings.signatureUrl,
        }),
      });
      if (res.ok) {
        setPrintTotalsSettings({
          ...getPrintTotalsSettings(),
          totalItemQuantity: settings.totalItemQuantity,
          amountWithDecimal: settings.amountWithDecimal,
          receivedAmount: settings.receivedAmount,
          balanceAmount: settings.balanceAmount,
          currentBalanceOfParty: settings.currentBalanceOfParty,
          previousBalance: settings.previousBalance,
          taxDetails: settings.taxDetails,
          discount: settings.discount,
          youSaved: settings.youSaved,
          amountInWords: settings.amountInWords,
          printDescription: settings.printDescription,
          printTermsAndConditions: settings.printTermsAndConditions,
          printSignatureText: settings.printSignatureText,
          paymentMode: settings.paymentMode,
        });
        // Clear removal flags in the committed baseline
        const committed = { ...settings, logoRemoved: false, signatureRemoved: false };
        setInitialSettings(committed);
        setSettings(committed);
        setIsSaving(false);
        setLocalToast({ message: "Settings saved successfully", type: "success" });
        setTimeout(() => setLocalToast(null), 3000);
        // Notify App.tsx so it can re-fetch the profile and refresh the sidebar logo
        window.dispatchEvent(new CustomEvent("profile-saved"));
        if (onSave) onSave();
      } else {
        setIsSaving(false);
        setLocalToast({ message: "Failed to save settings", type: "error" });
        setTimeout(() => setLocalToast(null), 3000);
      }
    } catch {
      setIsSaving(false);
      setLocalToast({ message: "An error occurred while saving", type: "error" });
      setTimeout(() => setLocalToast(null), 3000);
    }
  };

  const handleCancel = () => {
    setSettings(initialSettings);
    if (onCancel) onCancel();
  };

  const handleCompanyName = (v: string) => set("companyName", v);
  const handleLogo = (v: string) => {
    if (v === "") {
      // User clicked "Remove" — set removal flag and clear URL
      setSettings((prev) => ({ ...prev, logoUrl: "", logoRemoved: true }));
    } else {
      // New upload — clear any pending removal flag
      setSettings((prev) => ({ ...prev, logoUrl: v, logoRemoved: false }));
    }
  };
  const handleSignature = (v: string) => {
    if (v === "") {
      // User clicked "Remove" — set removal flag and clear URL
      setSettings((prev) => ({ ...prev, signatureUrl: "", signatureRemoved: true }));
    } else {
      // New upload — clear any pending removal flag
      setSettings((prev) => ({ ...prev, signatureUrl: v, signatureRemoved: false }));
    }
  };
  const handleAddress = (v: string) => set("address", v);
  const handleEmail = (v: string) => set("email", v);
  const handlePhone = (v: string) => set("phoneNumber", v);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#fff" }}>
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

      {/* ── Scrollable Sections ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* ── Print Company Info / Header ── */}
        <SettingsSection title="Print Company Info / Header">
          <ToggleRow label="Make Regular Printer Default" checked={settings.makeRegularDefault} onChange={(v) => set("makeRegularDefault", v)} />

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
          <ToggleRow label="Invoice Amount in Words" checked={settings.amountInWords} onChange={(v) => set("amountInWords", v)} />
          <ToggleRow label="Print Description" checked={settings.printDescription} onChange={(v) => set("printDescription", v)} />
          <ToggleRow label="Print Terms and Conditions" checked={settings.printTermsAndConditions} onChange={(v) => set("printTermsAndConditions", v)} />
          <ToggleRow label="Payment Mode" checked={settings.paymentMode} onChange={(v) => set("paymentMode", v)} />
          <InputRow label="Print Signature Text" value={settings.printSignatureText} onChange={(v) => set("printSignatureText", v)} />
          <SignatureUploadRow 
            signatureUrl={settings.signatureUrl} 
            onSignatureChange={handleSignature} 
          />
        </SettingsSection>
      </div>

      {/* ── Action Buttons pinned at bottom of Right Panel ── */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid #e5e7eb",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexShrink: 0,
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        {(hasUnsavedChanges || isDirty) && (
          <span
            title="You have unsaved changes"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        )}
        <button
          type="button"
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#374151",
            background: "#ffffff",
            border: "1.5px solid #d1d5db",
            borderRadius: "7px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#9ca3af";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.color = "#374151";
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            flex: 1.2,
            padding: "8px 14px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#ffffff",
            background: isSaving ? "#ef5350" : "#E53935",
            border: "none",
            borderRadius: "7px",
            cursor: isSaving ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(229, 57, 53, 0.25)",
            opacity: isSaving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = "#d32f2f";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = "#E53935";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Local Toast specifically for RightPanel in bottom left */}
      {localToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: localToast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)",
            animation: "slideInLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <style>{`
            @keyframes slideInLeft {
              from { transform: translateX(-30px) scale(0.95); opacity: 0; }
              to { transform: translateX(0) scale(1); opacity: 1; }
            }
          `}</style>
          {localToast.type === "success" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          )}
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.01em" }}>{localToast.message}</span>
        </div>
      )}
    </div>
  );
}
