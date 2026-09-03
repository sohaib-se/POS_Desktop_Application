import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { userProfile } from "@/data/mockData";

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

interface Theme2InvoicePrintReportProps {
  records: SaleInvoiceLineItem[];
  invoiceNo: string | number;
  invoiceDate: string;
  customerName: string;
  businessProfile?: any;
  received?: number;
}

// Minimal number-to-words for whole rupee amounts (extend as needed for paisa/large numbers)
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const chunk = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + chunk(n % 10);
    return ones[Math.floor(n / 100)] + " Hundred " + chunk(n % 100);
  };

  if (num === 0) return "Zero";
  let n = Math.floor(num);
  let words = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;

  if (crore) words += chunk(crore) + "Crore ";
  if (lakh) words += chunk(lakh) + "Lakh ";
  if (thousand) words += chunk(thousand) + "Thousand ";
  if (rest) words += chunk(rest);

  return words.trim();
}

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

export function Theme2InvoicePrintReport({
  records,
  invoiceNo,
  invoiceDate,
  customerName,
  businessProfile,
  received = 0,
}: Theme2InvoicePrintReportProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

  const ACCENT = "#8B85D6";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const fmt = (n: number) => `${currencyStr} ${n.toFixed(2)}`;

  const totalQuantity = records.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
  const subTotal = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const total = subTotal;
  const balance = total - Number(received || 0);

  // Pad the item table with blank rows so short invoices still fill a full page, Tally-style
  const MIN_ROWS = 10;
  const fillerRows = Math.max(0, MIN_ROWS - records.length);

  return (
    <div className="print-area bg-white text-black font-sans w-full max-w-[794px] mx-auto px-10 py-6">
      {/* Business Header */}
      <div className="flex items-center justify-between mb-3">
        <InvoiceLogo logoUrl={businessProfile?.logo_url} businessName={businessProfile?.business_name} size={56} />
        <div className="text-right">
          <h1 className="text-2xl font-bold">{businessProfile?.business_name || "My Company"}</h1>
          <p className="text-sm text-gray-800 mt-0.5">Phone no.: {businessProfile?.phone || ""}</p>
        </div>
      </div>

      {/* Invoice title */}
      <div className="border-t-2 border-black pt-2 mb-4">
        <h2 className="text-center text-xl font-bold text-black">Invoice</h2>
      </div>

      {/* Bill To / Invoice Details */}
      <div className="flex justify-between mb-1">
        <p className="text-sm font-bold">Bill To</p>
        <p className="text-sm font-bold">Invoice Details</p>
      </div>
      <div className="flex justify-between mb-4">
        <p className="text-sm font-bold">{customerName}</p>
        <div className="text-right text-sm">
          <p>Invoice No. : {invoiceNo}</p>
          <p>Date : {formatDate(invoiceDate)}</p>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full text-xs mb-0 border-collapse">
        <thead style={{ backgroundColor: ACCENT, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <tr className="text-white text-left">
            <th className="py-1.5 px-2 font-bold w-8">#</th>
            <th className="py-1.5 px-2 font-bold">Item name</th>
            <th className="py-1.5 px-2 font-bold text-right">Quantity</th>
            <th className="py-1.5 px-2 font-bold text-right">Unit</th>
            <th className="py-1.5 px-2 font-bold text-right">Price/ Unit</th>
            <th className="py-1.5 px-2 font-bold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={record.id ?? idx} className="text-xs border-b border-gray-300">
              <td className="py-1 px-2">{idx + 1}</td>
              <td className="py-1 px-2 font-bold">{record.itemName || record.item_name || ""}</td>
              <td className="py-1 px-2 text-right">{record.quantity ?? ""}</td>
              <td className="py-1 px-2 text-right">{record.unit || ""}</td>
              <td className="py-1 px-2 text-right whitespace-nowrap">
                {currencyStr} {Number(record.pricePerUnit ?? record.price_per_unit ?? 0).toFixed(2)}
              </td>
              <td className="py-1 px-2 text-right whitespace-nowrap">
                {currencyStr} {Number(record.amount || 0).toFixed(2)}
              </td>
            </tr>
          ))}
          {fillerRows > 0 && (
            <tr>
              <td style={{ height: `${fillerRows * 34}px` }}></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Total row */}
      <div className="flex justify-between items-center border-t border-b border-gray-400 py-1.5 mb-4">
        <span className="text-sm font-bold pl-2">Total</span>
        <span className="text-sm font-bold">{totalQuantity}</span>
        <span className="text-sm font-bold pr-2 whitespace-nowrap">{fmt(total)}</span>
      </div>

      {/* Footer: Amount in words + Amounts */}
      <div className="flex gap-4">
        <div className="flex-[55]">
          <div
            className="px-2 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: ACCENT, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            Invoice Amount In Words
          </div>
          <p className="text-xs mt-1.5">
            {numberToWords(total)} {currency.code === 'PKR' ? 'Rupees' : ''} only
          </p>
        </div>
        <div className="flex-[45]">
          <div
            className="px-2 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: ACCENT, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            Amounts
          </div>
          <div className="flex justify-between text-xs px-0 py-1 border-b border-gray-300">
            <span>Sub Total</span>
            <span className="whitespace-nowrap">{fmt(subTotal)}</span>
          </div>
          <div className="flex justify-between text-xs px-0 py-1 border-b border-gray-300 font-bold">
            <span>Total</span>
            <span className="whitespace-nowrap">{fmt(total)}</span>
          </div>
          <div className="flex justify-between text-xs px-0 py-1 border-b border-gray-300">
            <span>Received</span>
            <span className="whitespace-nowrap">{fmt(Number(received || 0))}</span>
          </div>
          <div className="flex justify-between text-xs px-0 py-1 border-b border-gray-300">
            <span>Balance</span>
            <span className="whitespace-nowrap">{fmt(balance)}</span>
          </div>
        </div>
      </div>

      {/* Signatory */}
      <div className="text-center mt-10">
        <p className="text-sm">For : {businessProfile?.business_name || "My Company"}</p>
      </div>
      <div className="text-center mt-16">
        <p className="text-sm font-bold">Authorized Signatory</p>
      </div>
    </div>
  );
}

/* ─────────────────────── Theme2Preview ─────────────────────────── */

const DUMMY_RECORDS = [
  { id: 1, itemName: "Book", quantity: 1, unit: "Bt", pricePerUnit: 100, amount: 100 },
];

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

export function Theme2Preview() {
  const company = useCompanyInfo();
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "16px 0" }}>
      <div style={{ zoom: 0.88, transformOrigin: "top center", width: 900, flexShrink: 0 }}>
        <Theme2InvoicePrintReport
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