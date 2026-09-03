import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { userProfile } from "@/data/mockData";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface TaxInvoiceLineItem {
  id?: string | number;
  itemName?: string;
  item_name?: string;
  quantity?: number | string;
  unit?: string;
  pricePerUnit?: number | string;
  price_per_unit?: number | string;
  amount?: number | string;
}

interface TaxInvoicePrintReportProps {
  records: TaxInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  businessProfile?: { business_name?: string; phone?: string; logo_url?: string };
  received?: number;
}

/* ─────────────────────── Dummy preview data ────────────────────────── */

const TAX_DUMMY_RECORDS: TaxInvoiceLineItem[] = [
  { id: 1, itemName: "Book", quantity: 1, unit: "Bt", pricePerUnit: 100, amount: 100 },
];

/* ──────────────────────── Number to words ──────────────────────────── */

function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const chunk = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + chunk(n % 10);
    return ones[Math.floor(n / 100)] + " Hundred " + chunk(n % 100);
  };
  if (num === 0) return "Zero";
  let n = Math.floor(num), words = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000);   n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const rest = n;
  if (crore) words += chunk(crore) + "Crore ";
  if (lakh) words += chunk(lakh) + "Lakh ";
  if (thousand) words += chunk(thousand) + "Thousand ";
  if (rest) words += chunk(rest);
  return words.trim();
}

/* ──────────────────────────── Logo ──────────────────────────────────── */

function InvoiceLogo({ logoUrl, businessName, size = 56 }: { logoUrl?: string; businessName?: string; size?: number }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={businessName ? `${businessName} logo` : "Business logo"}
        style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      />
    );
  }
  // Fallback placeholder so the layout holds steady before a logo is uploaded
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#E5E5EA",
        color: "#6B6B80",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {(businessName || "M").charAt(0).toUpperCase()}
    </div>
  );
}

/* ──────────────────── TaxInvoicePrintReport ───────────────────────── */

export function TaxInvoicePrintReport({
  records,
  invoiceNo,
  invoiceDate,
  customerName,
  businessProfile,
  received = 0,
}: TaxInvoicePrintReportProps) {
  const [currency] = useSettings("settings.businessCurrency", { code: "PKR", symbol: "Rs" });
  const [currencyDisplay] = useSettings<"abbreviation" | "icon">("settings.currencyDisplay", "abbreviation");
  const currencyStr = currencyDisplay === "icon" ? currency.symbol : currency.code;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
      const p = dateStr.split("/");
      if (p.length === 3) return `${p[0].padStart(2, "0")}/${p[1].padStart(2, "0")}/${p[2]}`;
    } else if (dateStr.includes("-")) {
      const p = dateStr.split("T")[0].split("-");
      if (p.length === 3 && p[0].length === 4) return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return dateStr;
  };

  const fmt = (n: number) => `${currencyStr} ${n.toFixed(2)}`;
  const totalQuantity = records.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const subTotal = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const total = subTotal;
  const balance = total - Number(received);

  const MIN_ROWS = 10;
  const fillerRows = Math.max(0, MIN_ROWS - records.length);

  const ACCENT = "#8B85D6";
  const BORDER = "#1a1a1a";

  return (
    <div style={{ background: "#fff", color: "#000", fontFamily: "Inter, system-ui, sans-serif", width: "100%", maxWidth: 794, margin: "0 auto", padding: "24px 40px", boxSizing: "border-box" }}>
      {/* Title (outside the bordered box) */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: 0 }}>Invoice</h1>
      </div>

      <div style={{ border: `1px solid ${BORDER}` }}>
        {/* Header: logo left, company info right */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", borderBottom: `1px solid ${BORDER}` }}>
          <InvoiceLogo logoUrl={businessProfile?.logo_url} businessName={businessProfile?.business_name} size={44} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{businessProfile?.business_name || "My Company"}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>Phone no.: {businessProfile?.phone || ""}</div>
          </div>
        </div>

        {/* Bill To / Invoice Details bar, split down the middle */}
        <div style={{ display: "flex", backgroundColor: ACCENT, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          <div style={{ width: "50%", padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>Bill To</div>
          <div style={{ width: "50%", padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "right" }}>Invoice Details</div>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: "50%", padding: "6px 10px", borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{customerName}</div>
          </div>
          <div style={{ width: "50%", padding: "6px 10px", textAlign: "right", fontSize: 11 }}>
            <div>Invoice No. : {invoiceNo}</div>
            <div>Date : {formatDate(invoiceDate)}</div>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: ACCENT, color: "#fff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, border: `1px solid ${BORDER}`, width: 24 }}>#</th>
              <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, border: `1px solid ${BORDER}` }}>Item name</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: `1px solid ${BORDER}` }}>Quantity</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: `1px solid ${BORDER}` }}>Unit</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: `1px solid ${BORDER}` }}>Price/ Unit</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: `1px solid ${BORDER}` }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={r.id ?? idx}>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}` }}>{idx + 1}</td>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, fontWeight: 700 }}>{r.itemName || r.item_name || ""}</td>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, textAlign: "right" }}>{r.quantity ?? ""}</td>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, textAlign: "right" }}>{r.unit || ""}</td>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>{currencyStr} {Number(r.pricePerUnit ?? r.price_per_unit ?? 0).toFixed(2)}</td>
                <td style={{ padding: "4px 8px", border: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>{currencyStr} {Number(r.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
            {fillerRows > 0 && (
              <tr>
                <td style={{ border: `1px solid ${BORDER}`, height: fillerRows * 28 }}></td>
                <td style={{ border: `1px solid ${BORDER}` }}></td>
                <td style={{ border: `1px solid ${BORDER}` }}></td>
                <td style={{ border: `1px solid ${BORDER}` }}></td>
                <td style={{ border: `1px solid ${BORDER}` }}></td>
                <td style={{ border: `1px solid ${BORDER}` }}></td>
              </tr>
            )}
            <tr style={{ fontWeight: 700 }}>
              <td style={{ padding: "6px 8px", border: `1px solid ${BORDER}` }} colSpan={2}>Total</td>
              <td style={{ padding: "6px 8px", border: `1px solid ${BORDER}`, textAlign: "right" }}>{totalQuantity}</td>
              <td style={{ border: `1px solid ${BORDER}` }}></td>
              <td style={{ border: `1px solid ${BORDER}` }}></td>
              <td style={{ padding: "6px 8px", border: `1px solid ${BORDER}`, textAlign: "right", whiteSpace: "nowrap" }}>{fmt(total)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer: Amounts (top-aligned, right) + Invoice Amount In Words (bottom-aligned, left) */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ width: "50%", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ backgroundColor: ACCENT, color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              Invoice Amount In Words
            </div>
            <div style={{ padding: "5px 10px", fontSize: 11 }}>
              {numberToWords(total)} {currency.code === "PKR" ? "Rupees" : ""} only
            </div>
          </div>
          <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
            <div style={{ backgroundColor: ACCENT, color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
              Amounts
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 11, borderBottom: "1px solid #e5e5e5" }}>
              <span>Sub Total</span><span style={{ whiteSpace: "nowrap" }}>{fmt(subTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #e5e5e5" }}>
              <span>Total</span><span style={{ whiteSpace: "nowrap" }}>{fmt(total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 11, borderBottom: "1px solid #e5e5e5" }}>
              <span>Received</span><span style={{ whiteSpace: "nowrap" }}>{fmt(Number(received))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 10px", fontSize: 11 }}>
              <span>Balance</span><span style={{ whiteSpace: "nowrap" }}>{fmt(balance)}</span>
            </div>
          </div>
        </div>

        {/* Signatory */}
        <div style={{ padding: "16px 12px", textAlign: "right", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11 }}>For : {businessProfile?.business_name || "My Company"}</div>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 40 }}>Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── TaxThemePreview ─────────────────────────── */

function useCompanyInfo() {
  const [info, setInfo] = useState({
    business_name: userProfile.businessName,
    phone: userProfile.phone,
    logo_url: (userProfile as any).logoUrl as string | undefined,
  });
  useEffect(() => {
    fetch("/api/user_profile")
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setInfo({
            business_name: d.business_name || userProfile.businessName,
            phone: d.phone || userProfile.phone,
            logo_url: d.logo_url || (userProfile as any).logoUrl,
          });
        }
      })
      .catch(() => {});
  }, []);
  return info;
}

export function TaxThemePreview() {
  const company = useCompanyInfo();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "16px 0" }}>
      <div style={{ zoom: 0.88, transformOrigin: "top center", width: 900, flexShrink: 0 }}>
        <TaxInvoicePrintReport
          records={TAX_DUMMY_RECORDS}
          invoiceNo={3}
          invoiceDate="2026-09-03"
          customerName="zeeshan"
          businessProfile={company}
          received={0}
        />
      </div>
    </div>
  );
}