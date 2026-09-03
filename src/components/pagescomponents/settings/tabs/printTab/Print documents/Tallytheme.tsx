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

interface SaleInvoicePrintReportProps {
  records: SaleInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  businessProfile?: { business_name?: string; phone?: string; logo_url?: string };
  received?: number;
}

/* ─────────────────────── Dummy preview data ────────────────────────── */

const DUMMY_RECORDS: SaleInvoiceLineItem[] = [
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

function InvoiceLogo({ logoUrl, businessName, size = 72 }: { logoUrl?: string; businessName?: string; size?: number }) {
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
        backgroundColor: "transparent",
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

/* ──────────────────── SaleInvoicePrintReport ───────────────────────── */

export function SaleInvoicePrintReport({
  records,
  invoiceNo,
  invoiceDate,
  customerName,
  businessProfile,
  received = 0,
}: SaleInvoicePrintReportProps) {
  const [currency] = useSettings("settings.businessCurrency", { code: "PKR", symbol: "Rs" });
  const [currencyDisplay] = useSettings<"abbreviation" | "icon">("settings.currencyDisplay", "abbreviation");
  const currencyStr = currencyDisplay === "icon" ? currency.symbol : currency.code;
  const HEADER_COLOR = "#3B3B58";

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

  return (
    <div style={{ background: "#fff", color: "#000", fontFamily: "Inter, system-ui, sans-serif", width: "100%", maxWidth: 794, margin: "0 auto", padding: "24px 40px", boxSizing: "border-box" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: HEADER_COLOR, margin: 0 }}>Invoice</h1>
      </div>

      {/* Company / Bill To / Invoice Details */}
      <div style={{ border: "1px solid #1a1a1a", marginBottom: 16 }}>
        <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 14 }}>
          <InvoiceLogo logoUrl={businessProfile?.logo_url} businessName={businessProfile?.business_name} size={72} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: HEADER_COLOR }}>{businessProfile?.business_name || "My Company"}</div>
            <div style={{ fontSize: 11, color: HEADER_COLOR, marginTop: 2 }}>Phone: <strong>{businessProfile?.phone || ""}</strong></div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ borderRight: "1px solid #1a1a1a" }}>
            <div style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #1a1a1a", backgroundColor: "#F2F2F2", color: HEADER_COLOR }}>Bill To:</div>
            <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700 }}>{customerName}</div>
          </div>
          <div>
            <div style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #1a1a1a", backgroundColor: "#F2F2F2", color: HEADER_COLOR }}>Invoice Details:</div>
            <div style={{ padding: "8px 12px", fontSize: 11, color: HEADER_COLOR, lineHeight: 1.6 }}>
              <div>Invoice No.: <strong>{invoiceNo}</strong></div>
              <div>Date: <strong>{formatDate(invoiceDate)}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse", border: "1px solid #1a1a1a" }}>
        <thead>
          <tr style={{ backgroundColor: "#D3D3D3", color: HEADER_COLOR }}>
            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, border: "1px solid #1a1a1a", width: 24 }}>#</th>
            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, border: "1px solid #1a1a1a" }}>Item name</th>
            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #1a1a1a" }}>Quantity</th>
            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #1a1a1a" }}>Unit</th>
            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #1a1a1a", whiteSpace: "nowrap" }}>Price/ Unit({currencyStr})</th>
            <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, border: "1px solid #1a1a1a", whiteSpace: "nowrap" }}>Amount({currencyStr})</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => (
            <tr key={r.id ?? idx}>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a" }}>{idx + 1}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a", fontWeight: 700 }}>{r.itemName || r.item_name || ""}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a", textAlign: "right" }}>{r.quantity ?? ""}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a", textAlign: "right" }}>{r.unit || ""}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a", textAlign: "right", whiteSpace: "nowrap" }}>{currencyStr} {Number(r.pricePerUnit ?? r.price_per_unit ?? 0).toFixed(2)}</td>
              <td style={{ padding: "4px 8px", border: "1px solid #1a1a1a", textAlign: "right", whiteSpace: "nowrap" }}>{currencyStr} {Number(r.amount || 0).toFixed(2)}</td>
            </tr>
          ))}
          {fillerRows > 0 && (
            <tr>
              <td style={{ border: "1px solid #1a1a1a", height: fillerRows * 28 }}></td>
              <td style={{ border: "1px solid #1a1a1a" }}></td>
              <td style={{ border: "1px solid #1a1a1a" }}></td>
              <td style={{ border: "1px solid #1a1a1a" }}></td>
              <td style={{ border: "1px solid #1a1a1a" }}></td>
              <td style={{ border: "1px solid #1a1a1a" }}></td>
            </tr>
          )}
          <tr style={{ fontWeight: 700 }}>
            <td style={{ padding: "6px 8px", border: "1px solid #1a1a1a" }} colSpan={2}>Total</td>
            <td style={{ padding: "6px 8px", border: "1px solid #1a1a1a", textAlign: "right" }}>{totalQuantity}</td>
            <td style={{ border: "1px solid #1a1a1a" }}></td>
            <td style={{ border: "1px solid #1a1a1a" }}></td>
            <td style={{ padding: "6px 8px", border: "1px solid #1a1a1a", textAlign: "right", whiteSpace: "nowrap" }}>{fmt(total)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals block */}
      <div style={{ border: "1px solid #1a1a1a", borderTop: "none", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", fontSize: 11, borderBottom: "1px solid #e5e5e5" }}>
          <span>Sub Total</span><span>:</span><span style={{ whiteSpace: "nowrap" }}>{fmt(subTotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", fontSize: 13, fontWeight: 700, borderBottom: "1px solid #1a1a1a", borderTop: "1px solid #1a1a1a" }}>
          <span>Total</span><span>:</span><span style={{ whiteSpace: "nowrap" }}>{fmt(total)}</span>
        </div>
        <div style={{ borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, backgroundColor: "#F2F2F2", color: HEADER_COLOR }}>Invoice Amount in Words:</div>
          <div style={{ padding: "6px 12px", fontSize: 11 }}>{numberToWords(total)} {currency.code === "PKR" ? "Rupees" : ""} only</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", fontSize: 11, borderBottom: "1px solid #e5e5e5" }}>
          <span>Received</span><span>:</span><span style={{ whiteSpace: "nowrap" }}>{fmt(Number(received))}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", fontSize: 11 }}>
          <span>Balance</span><span>:</span><span style={{ whiteSpace: "nowrap" }}>{fmt(balance)}</span>
        </div>
      </div>

      {/* Signatory */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ border: "1px solid #1a1a1a", width: 280 }}>
          <div style={{ padding: "4px 12px", fontSize: 11, fontWeight: 700, borderBottom: "1px solid #1a1a1a", backgroundColor: "#F2F2F2", color: HEADER_COLOR }}>
            For {businessProfile?.business_name || "My Company"}:
          </div>
          <div style={{ height: 64, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#555" }}>Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── TallyThemePreview ─────────────────────────── */

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

export function TallyThemePreview() {
  const company = useCompanyInfo();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "16px 0" }}>
      <div style={{ zoom: 0.88, transformOrigin: "top center", width: 900, flexShrink: 0 }}>
        <SaleInvoicePrintReport
          records={DUMMY_RECORDS}
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