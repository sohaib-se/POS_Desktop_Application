// Utility: export Party Transactions to a styled .xlsx file
// Design mirrors paymentin_transactions_*.xlsx:
//   - Header row: solid blue fill (#4382FF), white bold Calibri 12, center-aligned
//   - Data rows: no fill, Calibri 11, left-aligned (amounts right-aligned)
//   - Custom column widths sized to content

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

export interface PartyTransactionExportRow {
  type: string;
  invoiceNo: string;
  date: string;
  amount: number;
  balance: number;
}

export function exportPartyTransactionsToExcel(
  partyName: string,
  records: PartyTransactionExportRow[],
  selectedMonth: string, // "YYYY-MM"
  currencyCode: string
) {
  // ── Derive filename ─────────────────────────────────────────────────────────
  let monthLabel = "";
  let yearLabel = "";
  if (selectedMonth) {
    const [y, m] = selectedMonth.split("-");
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    monthLabel = monthNames[parseInt(m, 10)] || m;
    yearLabel = y;
  }
  const safeName = partyName.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const filename = `party_transactions_${safeName}_${monthLabel}_${yearLabel}.xlsx`;

  // ── Header definition ───────────────────────────────────────────────────────
  const HEADERS = [
    { label: "Type",       width: 22 },
    { label: "Invoice #",  width: 16 },
    { label: "Date",       width: 14 },
    { label: "Total",      width: 16 },
    { label: "Balance",    width: 16 },
  ];

  // ── Header row style (blue #4382FF, white bold Calibri 12) ──────────────────
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

  // ── Data row styles ─────────────────────────────────────────────────────────
  const dataStyleLeft = {
    font: { bold: false, sz: 11, name: "Calibri" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "E0E0E0" } },
      bottom: { style: "thin", color: { rgb: "E0E0E0" } },
      left:   { style: "thin", color: { rgb: "E0E0E0" } },
      right:  { style: "thin", color: { rgb: "E0E0E0" } },
    },
  };

  const dataStyleRight = {
    ...dataStyleLeft,
    alignment: { horizontal: "right", vertical: "center" },
  };

  // ── Build worksheet data ────────────────────────────────────────────────────
  const headerRow = HEADERS.map((h) => ({ v: h.label, t: "s", s: headerStyle }));

  const dataRows = records.map((r) => [
    { v: String(r.type || ""),                                    t: "s", s: dataStyleLeft  },
    { v: String(r.invoiceNo || ""),                               t: "s", s: dataStyleLeft  },
    { v: formatDate(r.date || ""),                                t: "s", s: dataStyleLeft  },
    { v: `${currencyCode} ${Number(r.amount).toFixed(2)}`,       t: "s", s: dataStyleRight },
    { v: `${currencyCode} ${Number(r.balance).toFixed(2)}`,      t: "s", s: dataStyleRight },
  ]);

  const wsData = [headerRow, ...dataRows];

  // ── Create worksheet ────────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Column widths ───────────────────────────────────────────────────────────
  ws["!cols"] = HEADERS.map((h) => ({ wch: h.width }));

  // ── Row heights ─────────────────────────────────────────────────────────────
  ws["!rows"] = [
    { hpt: 22 },
    ...records.map(() => ({ hpt: 18 })),
  ];

  // ── Workbook & download ─────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, filename);
}
