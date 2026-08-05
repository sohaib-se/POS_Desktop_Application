// --- SHARED TYPES for Products Tab Components ---

export type Item = {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
  imgPath?: string | null;
  unit?: string | null;
  primaryUnit?: string | null;
  secondaryUnit?: string | null;
  secondaryStock?: number | null;
  conversionRate?: number | null;
  minStock?: number | null;
  stockQuantity: number;
  salePrice: number;
  wholesalePrice: number;
  purchasePrice: number;
  stockValue: number;
  mfgDate?: string | null;
  expDate?: string | null;
  atPrice?: number;
};

export type ItemApiRecord = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  img_path: string | null;
  unit: string;
  primary_unit: string | null;
  secondary_unit: string | null;
  secondary_stock: number | null;
  conversion_rate: number | null;
  min_stock: number | null;
  sale_price: number;
  wholesale_price: number;
  purchase_price: number;
  stock_quantity: number;
  stock_value: number | null;
  mfg_date?: string | null;
  exp_date?: string | null;
  at_price?: number | null;
};

export type AddItemFormState = {
  itemName: string;
  categoryId: string;
  itemCode: string;
  salePrice: string;
  wholesalePrice: string;
  purchasePrice: string;
  minWholesaleQty: string;
  openingStock: string;
  atPrice: string;
  asOfDate: string;
  mfgDate: string;
  expDate: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  itemCount: number;
};

export type UnitRecord = {
  id: string;
  fullName: string;
  shortName: string;
};

export type ConversionRateRecord = {
  id: number;
  base_unit: string;
  secondary_unit: string;
  conversion_rate: number;
  created_at?: string;
};

export type ItemTransactionRow = {
  id: string;
  type: "Sale" | "Purchase" | "Add Stock" | "Reduce Stock";
  invoiceNo: string;
  partyName: string;
  date: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  balance: number;
  status: "Paid" | "Unpaid" | "Open" | "Cancelled";
  itemId?: string;
  itemName: string;
};

export type ItemTransactionLine = {
  id?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  amount?: number;
  itemId?: string;
  name?: string;
};

export type ItemTransactionApiRecord = {
  id: string;
  transaction_type?: string;
  invoice_no: string;
  party_name: string;
  date: string;
  balance?: number;
  status?: string;
  line_items_json?: string;
};

export type ItemContextMenuState = {
  item: Item;
  x: number;
  y: number;
};

export type AdjustStockForm = {
  type: "Add" | "Reduce";
  date: string;
  qty: string;
  unit: string;
  atPrice: string;
  details: string;
};
