import type { PurchaseBillViewRow, PurchaseBillLineItem } from "./types";

export function parseInvoiceDate(rawDate: string) {
  const match = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(rawDate);
  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

export function getMonthKeyFromDate(rawDate: string) {
  const parsedDate = parseInvoiceDate(rawDate);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const parsedDate = new Date(Number(year), Number(month) - 1, 1);
  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("en-GB");
}

export function createCsvContent(rows: PurchaseBillViewRow[]) {
  const headers = ["Date", "Invoice No", "Party Name", "Transaction", "Payment Type", "Amount", "Balance"];
  const escapeCell = (value: string) => {
    const normalized = value.replace(/"/g, '""');
    return `"${normalized}"`;
  };

  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) =>
      [
        row.date,
        row.invoiceNo,
        row.partyName,
        row.transaction,
        row.paymentType,
        row.amount.toString(),
        row.balance.toString(),
      ]
        .map((cell) => escapeCell(cell))
        .join(","),
    ),
  ];

  return lines.join("\n");
}

export function monthLabelForFilter(monthKey: string) {
  return monthKey ? formatMonthLabel(monthKey) : "All Months";
}

export function parseLineItems(lineItemsJson?: string | null) {
  if (!lineItemsJson) {
    return [] as PurchaseBillLineItem[];
  }

  try {
    const parsedValue = JSON.parse(lineItemsJson) as unknown;
    if (!Array.isArray(parsedValue)) {
      return [] as PurchaseBillLineItem[];
    }

    return parsedValue as PurchaseBillLineItem[];
  } catch {
    return [] as PurchaseBillLineItem[];
  }
}

export const fallbackPurchaseBills: PurchaseBillViewRow[] = [
  {
    id: "1",
    invoiceNo: "9",
    date: "21/02/2026",
    partyName: "Khan",
    transaction: "Purchase",
    paymentType: "Cash",
    amount: 160,
    balance: 160,
    monthKey: "2026-02",
  },
  {
    id: "2",
    invoiceNo: "8",
    date: "21/02/2026",
    partyName: "Khan",
    transaction: "Purchase",
    paymentType: "Cash",
    amount: 200,
    balance: 200,
    monthKey: "2026-02",
  },
  {
    id: "3",
    invoiceNo: "7",
    date: "21/02/2026",
    partyName: "Cash Sale",
    transaction: "Purchase",
    paymentType: "Cash",
    amount: 200,
    balance: 200,
    monthKey: "2026-02",
  },
  {
    id: "4",
    invoiceNo: "6",
    date: "20/02/2026",
    partyName: "Sohaib",
    transaction: "Purchase",
    paymentType: "Cash",
    amount: 160,
    balance: 160,
    monthKey: "2026-02",
  },
];
