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

interface ThermalTheme4Props {
  records: SaleInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  businessProfile?: { business_name?: string; phone?: string; address?: string; logo_url?: string };
  received?: number;
  discount?: number;
  discountPercent?: number;
}

/* ─────────────────────── Dummy preview data ────────────────────────── */

const DUMMY_RECORDS: SaleInvoiceLineItem[] = [
  { id: 1, itemName: "Book", quantity: 1, unit: "1Box", pricePerUnit: 100, amount: 100 },
];

/* ──────────────────── formatDate / formatTime ────────────────────────── */

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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ────────── Barcode strip — proportional flex bars, never overflows ──────
   Widths are relative (flex-grow), not fixed pixels, so the strip always
   fills the available width exactly regardless of container size.
------------------------------------------------------------------- */

function BarcodeStrip({ seed = 6 }: { seed?: number | string }) {
  const str = String(seed) + "receiptbarcode";
  const bars: number[] = [];
  for (let i = 0; i < 32; i++) {
    const code = str.charCodeAt(i % str.length) + i;
    bars.push((code % 3) + 1); // relative widths 1-3
  }
  return (
    <div style={{ display: "flex", height: 28, gap: 1 }}>
      {bars.map((w, i) => (
        <div key={i} style={{ flex: `${w} ${w} 0`, background: "#000" }} />
      ))}
    </div>
  );
}

/* ─────────── ThermalSaleInvoiceRetail — plain industry-standard look ───
   Same building blocks as the reference Theme 3 file — flex rows for
   meta/summary lines, a real <table> for items, border-based rules —
   so it renders reliably at any width or font-substitution outcome.
   No color anywhere: pure black ink on white, ALL-CAPS labels, dashed/
   solid rules, a barcode footer. This is the plain look nearly every
   retail register actually prints.
*/

export function ThermalSaleInvoiceRetail({
  records,
  invoiceNo,
  invoiceDate,
  customerName,
  customerPhone,
  businessProfile,
  received = 0,
  discount = 0,
  discountPercent,
}: ThermalTheme4Props) {
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
  const businessName = (businessProfile?.business_name || "My Company").toUpperCase();

  /* Shared row style — flex space-between, monospace font */
  const row: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    lineHeight: 1.7,
    fontSize: 12,
  };
  const rule = (char: "-" | "=") => (
    <div
      style={{
        borderTop: char === "=" ? "2px solid #000" : "1px dashed #555",
        margin: "5px 0",
      }}
    />
  );

  return (
    <div
      style={{
        background: "#fff",
        color: "#000",
        fontFamily: "'Courier New', Courier, Consolas, monospace",
        width: "100%",
        maxWidth: 380,
        margin: "0 auto",
        padding: "16px 14px 24px",
        boxSizing: "border-box",
        fontSize: 12,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        {businessProfile?.logo_url && (
          <img
            src={businessProfile.logo_url}
            alt="logo"
            style={{ width: 52, height: 52, objectFit: "contain", display: "block", margin: "0 auto 4px" }}
          />
        )}
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>{businessName}</div>
        {businessProfile?.address && (
          <div style={{ fontSize: 11 }}>{businessProfile.address}</div>
        )}
        {businessProfile?.phone && (
          <div style={{ fontSize: 11 }}>TEL: {businessProfile.phone}</div>
        )}
      </div>

      {rule("-")}
      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700 }}>SALES RECEIPT</div>
      {rule("-")}

      {/* ── META ── */}
      <div style={row}><span>RECEIPT #</span><span>{invoiceNo}</span></div>
      <div style={row}><span>DATE</span><span>{formatDate(invoiceDate)} {formatTime(invoiceDate)}</span></div>
      <div style={row}><span>CUSTOMER</span><span>{customerName}</span></div>
      {customerPhone && <div style={row}><span>PHONE</span><span>{customerPhone}</span></div>}

      {rule("=")}

      {/* ── ITEMS ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", fontWeight: 700, padding: "2px 0" }}>ITEM</th>
            <th style={{ textAlign: "center", fontWeight: 700, padding: "2px 0" }}>QTY</th>
            <th style={{ textAlign: "right", fontWeight: 700, padding: "2px 0" }}>PRICE</th>
            <th style={{ textAlign: "right", fontWeight: 700, padding: "2px 0" }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => {
            const qtyWithUnit = r.unit ? `${r.quantity ?? ""}${r.unit}` : `${r.quantity ?? ""}`;
            return (
              <tr key={r.id ?? idx}>
                <td style={{ padding: "2px 0", wordBreak: "break-word" }}>
                  {(r.itemName || r.item_name || "").toUpperCase()}
                </td>
                <td style={{ padding: "2px 0", textAlign: "center" }}>{qtyWithUnit}</td>
                <td style={{ padding: "2px 0", textAlign: "right" }}>
                  {fmt(Number(r.pricePerUnit ?? r.price_per_unit ?? 0))}
                </td>
                <td style={{ padding: "2px 0", textAlign: "right", fontWeight: 700 }}>
                  {fmt(Number(r.amount || 0))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {rule("-")}

      <div style={row}><span>TOTAL QTY</span><span>{totalQuantity}</span></div>
      <div style={row}><span>SUBTOTAL</span><span>{fmt(subTotal)}</span></div>

      {discount > 0 && (
        <div style={row}>
          <span>DISCOUNT{discountPercent != null ? `(${discountPercent}%)` : ""}</span>
          <span>-{fmt(Number(discount))}</span>
        </div>
      )}

      {rule("=")}

      <div style={{ ...row, fontSize: 16, fontWeight: 800, margin: "2px 0" }}>
        <span>TOTAL</span>
        <span>{fmt(total)}</span>
      </div>

      {rule("=")}

      <div style={row}><span>CASH TENDERED</span><span>{fmt(Number(received))}</span></div>
      <div style={{ ...row, fontWeight: 700 }}>
        <span>{balance > 0 ? "BALANCE DUE" : "CHANGE DUE"}</span>
        <span>{fmt(Math.abs(balance))}</span>
      </div>

      {youSaved > 0 && (
        <>
          {rule("-")}
          <div style={row}><span>YOU SAVED</span><span>{fmt(youSaved)}</span></div>
        </>
      )}

      {rule("-")}

      {/* ── FOOTER ── */}
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>THANK YOU</div>
        <div style={{ fontSize: 10, marginTop: 1 }}>PLEASE RETAIN FOR RETURNS</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <BarcodeStrip seed={invoiceNo} />
        <div style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, marginTop: 3 }}>
          {String(invoiceNo).padStart(12, "0")}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── useCompanyInfo ──────────────────────────── */

function useCompanyInfo() {
  const [info, setInfo] = useState({
    business_name: userProfile.businessName,
    phone: userProfile.phone,
    address: (userProfile as any).address as string | undefined,
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
            address: d.address || (userProfile as any).address,
            logo_url: d.logo_url || d.logo || userProfile.logo,
          });
        }
      })
      .catch(() => { });
  }, []);

  return info;
}

/* ───────────────────────── Preview export ──────────────────────────── */

export function ThermalTheme4Preview() {
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
      <div
        style={{
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          borderRadius: 4,
          width: 380,
          flexShrink: 0,
        }}
      >
        <ThermalSaleInvoiceRetail
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