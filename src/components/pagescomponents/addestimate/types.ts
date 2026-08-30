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
  customerSearch: string;
  estimateNo: string;
  estimateDate: string;
  rows: SaleRow[];
  discountPercent: string;
  discountRs: string;
  tax: string;
  roundOff: boolean;
  description: string;
  showDescriptionInput: boolean;
  image: File | null;
  document: File | null;
  imageDataUrl?: string;
  imageFileName?: string;
  documentDataUrl?: string;
  documentFileName?: string;
}
