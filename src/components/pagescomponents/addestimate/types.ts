export interface SaleRow {
  id: number;
  item: string;
  qty: string;
  unit: string;
  pricePerUnit: string;
}

export interface SaleTab {
  id: number;
  label: string;
  paymentMode: "credit" | "cash";
  customerSearch: string;
  phoneNo: string;
  rows: SaleRow[];
  discountPercent: string;
  discountRs: string;
  tax: string;
  roundOff: boolean;
  description: string;
  showDescriptionInput: boolean;
}
