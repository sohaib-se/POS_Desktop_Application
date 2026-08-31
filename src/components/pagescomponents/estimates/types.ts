export interface EstimateRecord {
  id: string;
  date: string;
  referenceNo: string;
  partyName: string;
  amount: number;
  balance: number;
  status: string;
  convertedSaleNo?: string;
  lineItemsJson?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxLabel?: string;
  taxRate?: number;
  taxAmount?: number;
  roundOff?: boolean;
  roundOffAmount?: number;
  description?: string;
  attachmentImagePath?: string | null;
  attachmentImageName?: string | null;
  attachmentDocumentPath?: string | null;
  attachmentDocumentName?: string | null;
}
