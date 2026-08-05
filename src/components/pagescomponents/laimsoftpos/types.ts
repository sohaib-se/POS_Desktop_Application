export interface PartyOption {
  id: number;
  name: string;
  phone: string;
  balance: number;
  type: "customer" | "supplier" | "both";
}

export interface ItemOption {
  id: string;
  name: string;
  code?: string;
  sale_price?: number;
  unit: string;
  primary_unit?: string | null;
  secondary_unit?: string | null;
  conversion_rate?: number | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  wholesale_price?: number;
  min_stock?: number | null;
}

export interface BankOption {
  id: number;
  name: string;
  account_number?: string;
}

export interface PosRow {
  id: number;
  itemId: string;
  itemCode: string;
  itemName: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

export interface PosTab {
  id: number;
  invoiceNo: string;
  date: string;
  rows: PosRow[];
  paymentMode: string;
  amountReceived: string;
  isAmountReceivedDirty: boolean;
  customerSelectedId: number | null;
  customerSearchText: string;
  searchQuery: string;
  selectedRowId: number | null;
  discountPercent: string;
  discountAmount: string;
  description: string;
}
