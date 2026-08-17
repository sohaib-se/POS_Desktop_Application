/** Sale data passed to the Bill Preview page after a successful save. */
export interface BillPreviewSaleData {
  invoiceNo: string;
  date: string;
  partyName: string;
  partyPhone?: string | null;
  paymentMode: "cash" | "credit";
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  roundOff: boolean;
  roundOffAmount: number;
  grandTotal: number;
  received: number;
  balance: number;
  description?: string;
  termsAndConditions?: string;
  lineItems: BillPreviewLineItem[];
}

export interface BillPreviewLineItem {
  id?: number;
  itemId?: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
}
