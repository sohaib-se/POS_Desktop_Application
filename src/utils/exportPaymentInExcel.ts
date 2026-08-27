// Utility: export Payment-In transactions to a styled .xlsx file
// Design mirrors sample_items.xlsx:
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

export function exportPaymentInToExcel(
  records: any[],
  selectedMonth: string,   // "YYYY-MM"
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
  const filename = `paymentin_transactions_${monthLabel}_${yearLabel}.xlsx`;

  // ── Header definition ───────────────────────────────────────────────────────
  const HEADERS = [
    { label: "Date",         width: 16 },
    { label: "Receipt No.",  width: 14 },
    { label: "Party Name",   width: 28 },
    { label: "Amount",       width: 16 },
    { label: "Payment Type", width: 18 },
    { label: "Description",  width: 30 },
  ];

  // ── Header row style (mirrors sample: blue #4382FF, white bold Calibri 12) ──
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

  // ── Data row base style (mirrors sample: no fill, Calibri 11) ───────────────
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
    { v: formatDate(r.date || ""),                              t: "s", s: dataStyleLeft  },
    { v: String(r.receiptNo || r.receipt_no || ""),            t: "s", s: dataStyleLeft  },
    { v: String(r.partyName || r.party_name || ""),            t: "s", s: dataStyleLeft  },
    { v: `${currencyCode} ${Number(r.amount || 0).toFixed(2)}`, t: "s", s: dataStyleRight },
    { v: String(r.paymentType || r.payment_type || ""),        t: "s", s: dataStyleLeft  },
    { v: String(r.description || ""),                          t: "s", s: dataStyleLeft  },
  ]);

  const wsData = [headerRow, ...dataRows];

  // ── Create worksheet ────────────────────────────────────────────────────────
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Column widths ───────────────────────────────────────────────────────────
  ws["!cols"] = HEADERS.map((h) => ({ wch: h.width }));

  // ── Row heights: header taller, data rows standard ──────────────────────────
  ws["!rows"] = [
    { hpt: 22 },                          // header row
    ...records.map(() => ({ hpt: 18 })),  // data rows
  ];

  // ── Workbook & download ─────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment In");
  XLSX.writeFile(wb, filename);
}
