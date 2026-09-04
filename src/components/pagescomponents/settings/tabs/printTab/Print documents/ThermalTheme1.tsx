import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { userProfile } from "@/data/mockData";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface SaleInvoiceLineItem {
  id?: string | number;
  itemName?: string;
  item_name?: string;
  quantity?: number | string;
  unit?: string;
  pricePerUnit?: number | string;
  price_per_unit?: number | string;
  amount?: number | string;
}

interface ThermalTheme1Props {
  records: SaleInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  businessProfile?: { business_name?: string; phone?: string; logo_url?: string };
  received?: number;
  discount?: number;
  discountPercent?: number;
}

/* ─────────────────────── Dummy preview data ────────────────────────── */

const DUMMY_RECORDS: SaleInvoiceLineItem[] = [
  { id: 1, itemName: "Book", quantity: 1, unit: "1Box", pricePerUnit: 100, amount: 100 },
];

/* ──────────────────────────── Logo ──────────────────────────────────── */

function ThermalLogo({
  logoUrl,
  businessName,
  size = 64,
}: {
  logoUrl?: string;
  businessName?: string;
  size?: number;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={businessName ? `${businessName} logo` : "Business logo"}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          display: "block",
          margin: "0 auto 2px",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        margin: "0 auto 2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.45,
        fontWeight: 900,
        color: "#111",
      }}
    >
      {(businessName || "M").charAt(0).toUpperCase()}
    </div>
  );
}

/* ──────────────────── Full-width dashed separator ───────────────────── */

function DashDivider() {
  return (
    <div
      style={{
        borderTop: "1px dashed #999",
        margin: "5px 0",
      }}
    />
  );
}

/* ──────────────────── formatDate ───────────────────────────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) {
    const p = dateStr.split("/");
    if (p.length === 3) return `${p[0].padStart(2, "0")}/${p[1].padStart(2, "0")}/${p[2]}`;
  } else if (dateStr.includes("-")) {
    const p = dateStr.split("T")[0].split("-");
    if (p.length === 3 && p[0].length === 4) return `${p[2]}/${p[1]}/${p[0]}`;
  }
  return dateStr;
}

/* ──────────────────── ThermalSaleInvoice ───────────────────────────── */

export function ThermalSaleInvoice({
  records,
  invoiceNo,
  invoiceDate,
  customerName,
  customerPhone,
  businessProfile,
  received = 0,
  discount = 0,
  discountPercent,
}: ThermalTheme1Props) {
  const [currency] = useSettings("settings.businessCurrency", { code: "PKR", symbol: "Rs" });
  const [currencyDisplay] = useSettings<"abbreviation" | "icon">(
    "settings.currencyDisplay",
    "abbreviation"
  );
  void currencyDisplay;
  void currency;

  const totalQuantity = records.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const subTotal = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const total = subTotal - Number(discount);
  const balance = total - Number(received);
  const youSaved = Number(discount);

  const fmt = (n: number) => n.toFixed(2);

  /* ── Label color used for summary rows ── */
  const LABEL_COLOR = "#111";

  return (
    <div
      style={{
        background: "#fff",
        color: "#111",
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        width: "100%",
        maxWidth: 380,
        margin: "0 auto",
        padding: "14px 14px 24px",
        boxSizing: "border-box",
        fontSize: 12,
      }}
    >
      {/* ────────── HEADER ────────── */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        {/* Logo */}
        <ThermalLogo
          logoUrl={businessProfile?.logo_url}
          businessName={businessProfile?.business_name}
          size={60}
        />

        {/* Business name — bold */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#111",
            marginBottom: 1,
          }}
        >
          {businessProfile?.business_name || "My Company"}
        </div>

        {/* Phone — orange */}
        {businessProfile?.phone && (
          <div style={{ fontSize: 11, color: "#111", fontWeight: 500 }}>
            Ph.No.: {businessProfile.phone}
          </div>
        )}
      </div>

      <DashDivider />

      {/* ── Invoice label ── */}
      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        Invoice
      </div>

      {/* ────────── CUSTOMER ROW ────────── */}
      {/* Customer name + phone on LEFT, Date + Invoice No on RIGHT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Left: customer info */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{customerName}</div>
          {customerPhone && (
            <div style={{ fontSize: 11, color: "#111", fontWeight: 500 }}>
              Ph. No.: {customerPhone}
            </div>
          )}
        </div>

        {/* Right: date + invoice no */}
        <div style={{ textAlign: "right", fontSize: 11, color: "#333", lineHeight: 1.7 }}>
          <div>Date: {formatDate(invoiceDate)}</div>
          <div>Invoice No.: {invoiceNo}</div>
        </div>
      </div>

      <DashDivider />

      {/* ────────── ITEMS TABLE ────────── */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "7%" }} />   {/* # */}
          <col style={{ width: "33%" }} />  {/* Name */}
          <col style={{ width: "16%" }} />  {/* Qty */}
          <col style={{ width: "22%" }} />  {/* Price */}
          <col style={{ width: "22%" }} />  {/* Amount */}
        </colgroup>

        {/* Column headers */}
        <thead>
          <tr>
            <th
              style={{ fontWeight: 700, textAlign: "left", padding: "2px 0", fontSize: 12 }}
            >
              #
            </th>
            <th
              style={{ fontWeight: 700, textAlign: "left", padding: "2px 0", fontSize: 12 }}
            >
              Name
            </th>
            <th
              style={{ fontWeight: 700, textAlign: "center", padding: "2px 0", fontSize: 12 }}
            >
              Qty
            </th>
            <th
              style={{ fontWeight: 700, textAlign: "right", padding: "2px 0", fontSize: 12 }}
            >
              Price
            </th>
            <th
              style={{ fontWeight: 700, textAlign: "right", padding: "2px 0", fontSize: 12 }}
            >
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Dashed line below headers */}
          <tr>
            <td colSpan={5} style={{ padding: 0 }}>
              <div style={{ borderTop: "1px dashed #999", margin: "2px 0" }} />
            </td>
          </tr>

          {/* Item rows */}
          {records.map((r, idx) => {
            const qtyWithUnit = r.unit
              ? `${r.quantity ?? ""}${r.unit}`
              : `${r.quantity ?? ""}`;
            return (
              <tr key={r.id ?? idx}>
                <td style={{ padding: "2px 0", textAlign: "left", fontSize: 12 }}>
                  {idx + 1}
                </td>
                <td
                  style={{
                    padding: "2px 0",
                    textAlign: "left",
                    fontSize: 12,
                    wordBreak: "break-word",
                  }}
                >
                  {r.itemName || r.item_name || ""}
                </td>
                <td style={{ padding: "2px 0", textAlign: "center", fontSize: 12 }}>
                  {qtyWithUnit}
                </td>
                <td style={{ padding: "2px 0", textAlign: "right", fontSize: 12 }}>
                  {fmt(Number(r.pricePerUnit ?? r.price_per_unit ?? 0))}
                </td>
                <td style={{ padding: "2px 0", textAlign: "right", fontSize: 12 }}>
                  {fmt(Number(r.amount || 0))}
                </td>
              </tr>
            );
          })}

          {/* Dashed line above Total row */}
          <tr>
            <td colSpan={5} style={{ padding: 0 }}>
              <div style={{ borderTop: "1px dashed #999", margin: "2px 0" }} />
            </td>
          </tr>

          {/* Total row */}
          <tr style={{ fontWeight: 700 }}>
            <td
              colSpan={2}
              style={{ padding: "2px 0", textAlign: "left", fontSize: 12 }}
            >
              Total
            </td>
            <td style={{ padding: "2px 0", textAlign: "center", fontSize: 12 }}>
              {totalQuantity}
            </td>
            <td style={{ padding: "2px 0" }} />
            <td style={{ padding: "2px 0", textAlign: "right", fontSize: 12 }}>
              {fmt(subTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ────────── SUMMARY BLOCK ────────── */}
      {/* Indented rows: Disc / Total / Received / Balance */}
      <div style={{ marginTop: 2, fontSize: 12 }}>

        {/* Discount row — only shown if discount > 0 */}
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.9 }}>
            <span style={{ paddingLeft: 24, color: LABEL_COLOR, fontWeight: 600 }}>
              Disc.{discountPercent != null ? `(${discountPercent}%)` : ""}
            </span>
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span>:</span>
              <span style={{ minWidth: 60, textAlign: "right", fontWeight: 600 }}>
                -{fmt(Number(discount))}
              </span>
            </span>
          </div>
        )}

        {/* Total (after discount) */}
        <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.9 }}>
          <span style={{ paddingLeft: 24, color: LABEL_COLOR, fontWeight: 700 }}>Total</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span>:</span>
            <span style={{ minWidth: 60, textAlign: "right", fontWeight: 700 }}>
              {fmt(total)}
            </span>
          </span>
        </div>

        {/* Received */}
        <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.9 }}>
          <span style={{ paddingLeft: 24, color: LABEL_COLOR, fontWeight: 600 }}>Received</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span>:</span>
            <span style={{ minWidth: 60, textAlign: "right" }}>{fmt(Number(received))}</span>
          </span>
        </div>

        {/* Balance */}
        <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.9 }}>
          <span style={{ paddingLeft: 24, color: LABEL_COLOR, fontWeight: 600 }}>Balance</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span>:</span>
            <span style={{ minWidth: 60, textAlign: "right" }}>{fmt(balance)}</span>
          </span>
        </div>
      </div>

      {/* ── You Saved (only shown if discount > 0) ── */}
      {youSaved > 0 && (
        <>
          <DashDivider />
          <div style={{ display: "flex", justifyContent: "space-between", lineHeight: 1.9, fontSize: 12 }}>
            <span style={{ paddingLeft: 24, color: LABEL_COLOR, fontWeight: 600 }}>
              You Saved
            </span>
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span>:</span>
              <span style={{ minWidth: 60, textAlign: "right", fontWeight: 700 }}>
                {fmt(youSaved)}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────────── useCompanyInfo ──────────────────────────── */

function useCompanyInfo() {
  const [info, setInfo] = useState({
    business_name: userProfile.businessName,
    phone: userProfile.phone,
    logo_url: userProfile.logo as string | undefined,
  });

  useEffect(() => {
    fetch("/api/user_profile")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setInfo({
            business_name: d.business_name || userProfile.businessName,
            phone: d.phone || userProfile.phone,
            logo_url: d.logo_url || d.logo || userProfile.logo,
          });
        }
      })
      .catch(() => {});
  }, []);

  return info;
}

/* ───────────────────────── Preview export ──────────────────────────── */

export function ThermalTheme1Preview() {
  const company = useCompanyInfo();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "24px 0",
      }}
    >
      {/* Simulate thermal paper ~80mm */}
      <div
        style={{
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          borderRadius: 4,
          width: 380,
          flexShrink: 0,
        }}
      >
        <ThermalSaleInvoice
          records={DUMMY_RECORDS}
          invoiceNo={6}
          invoiceDate="2026-09-04"
          customerName="Zeeshan"
          customerPhone="03129955494"
          businessProfile={company}
          received={50}
          discount={50}
          discountPercent={50}
        />
      </div>
    </div>
  );
}
