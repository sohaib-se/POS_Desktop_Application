export interface PurchaseRow {
  id: number;
  itemId: string;
  item: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

export interface PurchaseTab {
  id: number;
  label: string;
  paymentMode: "credit" | "cash";
  customerSearch: string;
  phoneNo: string;
  rows: PurchaseRow[];
  discountPercent: string;
  discountRs: string;
  tax: string;
  roundOff: boolean;
  description: string;
  showDescriptionInput: boolean;
  imageDataUrl: string;
  imageFileName: string;
  documentDataUrl: string;
  documentFileName: string;
  paid: string;
  paidAll: boolean;
  paymentType: string;
}

export interface PartyOption {
  id: number;
  name: string;
  phone: string;
  balance: number;
  type: "customer" | "supplier" | "both";
  status?: 'active' | 'inactive';
}

export interface ItemOption {
  id: string;
  name: string;
  purchase_price?: number;
  unit: string;
  primary_unit?: string | null;
  secondary_unit?: string | null;
  conversion_rate?: number | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  status?: 'active' | 'inactive';
}

export interface BankOption {
  id: number;
  display_name: string;
  bank_name?: string;
  balance: number;
}
