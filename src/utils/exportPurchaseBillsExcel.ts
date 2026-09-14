// Utility: export Purchase Bills to a styled .xlsx file
// Header row: blue #4382FF fill, white bold Calibri 12, centered
// Data rows: Calibri 11, left-aligned (amounts right-aligned)

import * as XLSX from "xlsx-js-style";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3)
      return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`;
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
  }
  return dateStr;
}

export interface PurchaseBillExportRow {
  date: string;
  invoiceNo: string | number;
  partyName: string;
  transaction: string;
  paymentType: string;
  amount: number;
  balance: number;
}

export function exportPurchaseBillsToExcel(
  rows: PurchaseBillExportRow[],
  monthKey: string,       // e.g. "Sep-2026"
  currencyCode: string
) {
  // ── Filename ────────────────────────────────────────────────────────────────
  const safeMonth = (monthKey || "all").replace(/\s+/g, "_");
  const filename = `purchase_bills_${safeMonth}.xlsx`;

  // ── Column definitions ───────────────────────────────────────────────────────
  const HEADERS = [
    { label: "Date",         width: 14 },
    { label: "Invoice No.",  width: 14 },
    { label: "Party Name",   width: 24 },
    { label: "Transaction",  width: 18 },
    { label: "Payment Type", width: 16 },
    { label: "Amount",       width: 16 },
    { label: "Balance",      width: 16 },
  ];

  // ── Styles ───────────────────────────────────────────────────────────────────
  const headerStyle = {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "4382FF" }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left:   { style: "thin", color: { rgb: "CCCCCC" } },
      right:  { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };

  const cellLeft = {
    font: { sz: 11, name: "Calibri" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left:   { style: "thin", color: { rgb: "E0E0E0" } },
      right:  { style: "thin", color: { rgb: "E0E0E0" } },
    },
  };

  const cellRight = {
    ...cellLeft,
    alignment: { horizontal: "right", vertical: "center" },
  };

  // ── Build data ───────────────────────────────────────────────────────────────
  const headerRow = HEADERS.map((h) => ({ v: h.label, t: "s", s: headerStyle }));

  const curr = currencyCode || "PKR";
  const dataRows = rows.map((r) => [
    { v: formatDate(r.date || ""),                                      t: "s", s: cellLeft  },
    { v: String(r.invoiceNo ?? ""),                                     t: "s", s: cellLeft  },
    { v: String(r.partyName ?? ""),                                     t: "s", s: cellLeft  },
    { v: String(r.transaction ?? ""),                                   t: "s", s: cellLeft  },
    { v: String(r.paymentType ?? ""),                                   t: "s", s: cellLeft  },
    { v: `${curr} ${Number(r.amount || 0).toFixed(2)}`,                 t: "s", s: cellRight },
    { v: `${curr} ${Number(r.balance || 0).toFixed(2)}`,                t: "s", s: cellRight },
  ]);

  const wsData = [headerRow, ...dataRows];

  // ── Worksheet ────────────────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = HEADERS.map((h) => ({ wch: h.width }));
  ws["!rows"] = [{ hpt: 22 }, ...rows.map(() => ({ hpt: 18 }))];

  // ── Workbook & download ──────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchase Bills");
  XLSX.writeFile(wb, filename);
}
