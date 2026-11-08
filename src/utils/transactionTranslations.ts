import type { TFunction } from "i18next";

/**
 * Maps raw database transaction types (e.g. "Sale", "Purchase", "PoS Sale", etc.)
 * to their localized representation using react-i18next.
 */
export function formatTransactionType(
  type: string | undefined | null,
  t: TFunction | ((key: string, defaultValue?: string) => string)
): string {
  if (!type) return "";
  const trimmed = type.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "sale") return t("transactions.types.sale", "Sale");
  if (lower === "purchase") return t("transactions.types.purchase", "Purchase");
  if (lower === "pos sale") return t("transactions.types.posSale", "POS Sale");
  if (lower === "estimate" || lower === "quotation") return t("transactions.types.estimate", "Estimate");
  if (lower === "payment in" || lower === "payment-in") return t("transactions.types.paymentIn", "Payment-In");
  if (lower === "payment out" || lower === "payment-out") return t("transactions.types.paymentOut", "Payment-Out");
  if (lower === "expense") return t("transactions.types.expense", "Expense");
  if (lower === "sale return") return t("transactions.types.saleReturn", "Sale Return");
  if (lower === "purchase return") return t("transactions.types.purchaseReturn", "Purchase Return");
  if (lower.includes("returned")) return t("transactions.types.returned", "Returned");
  if (lower.includes("payable opening balance")) return t("transactions.types.payableOpening", "Payable Opening Balance");
  if (lower.includes("receivable opening balance")) return t("transactions.types.receivableOpening", "Receivable Opening Balance");
  if (lower.includes("opening balance")) return t("parties.openingBalance", "Opening Balance");
  if (lower === "increase cash" || lower === "add cash") return t("cashBank.addCash", "Add Cash");
  if (lower === "decrease cash" || lower === "reduce cash") return t("cashBank.reduceCash", "Reduce Cash");
  if (lower.includes("transfer to cash")) return t("cashBank.transferToCash", "Transfer to Cash");
  if (lower.includes("transfer from cash")) return t("cashBank.transferFromCash", "Transfer from Cash");
  if (lower.includes("bank to bank")) return t("cashBank.bankToBank", "Bank to Bank Transfer");
  if (lower === "deposit") return t("cashBank.deposit", "Deposit");
  if (lower === "withdraw" || lower === "withdrawal") return t("cashBank.withdraw", "Withdrawal");
  if (lower.includes("cash adjustment")) return t("cashBank.cashAdjustment", "Cash Adjustment");

  return trimmed;
}

/**
 * Maps raw payment types (e.g. "Cash", "Cheque", "Online", etc.)
 * to their localized representation.
 */
export function formatPaymentType(
  paymentType: string | undefined | null,
  t: TFunction | ((key: string, defaultValue?: string) => string)
): string {
  if (!paymentType) return "";
  const trimmed = paymentType.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "cash") return t("paymentTypes.cash", "Cash");
  if (lower === "cheque" || lower === "check") return t("paymentTypes.cheque", "Cheque");
  if (lower === "online") return t("paymentTypes.online", "Online");
  if (lower === "credit") return t("paymentTypes.credit", "Credit");
  if (lower === "bank") return t("paymentTypes.bank", "Bank");
  if (lower === "card") return t("paymentTypes.card", "Card");
  if (lower === "upi") return t("paymentTypes.upi", "UPI");
  if (lower === "net banking" || lower === "netbanking") return t("paymentTypes.netBanking", "Net Banking");
  if (lower.includes("payable opening balance")) return t("transactions.types.payableOpening", "Payable Opening Balance");
  if (lower.includes("receivable opening balance")) return t("transactions.types.receivableOpening", "Receivable Opening Balance");
  if (lower.includes("opening balance")) return t("parties.openingBalance", "Opening Balance");

  return trimmed;
}

/**
 * Maps transaction status (e.g. "Paid", "Unpaid", "Open", etc.)
 * to their localized representation.
 */
export function formatTransactionStatus(
  status: string | undefined | null,
  t: TFunction | ((key: string, defaultValue?: string) => string)
): string {
  if (!status) return "";
  const trimmed = status.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "paid") return t("common.paid", "Paid");
  if (lower === "unpaid") return t("common.unpaid", "Unpaid");
  if (lower === "open") return t("estimates.open", "Open");
  if (lower === "converted") return t("estimates.converted", "Converted");
  if (lower === "cancelled" || lower === "canceled") return t("common.cancelled", "Cancelled");
  if (lower === "partial") return t("common.partial", "Partial");

  return trimmed;
}

