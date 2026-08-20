import type { BillPreviewSaleData } from "./BillPreviewData";

export const DUMMY_REGULAR_SALE: BillPreviewSaleData = {
  invoiceNo: "Inv. 101",
  date: "02-07-2019",
  partyName: "Party that user select at time of sale.",
  partyPhone: "8888888888",
  paymentMode: "cash",
  subtotal: 40.00,
  discountPercent: 0,
  discountAmount: 0.10,
  taxLabel: "GST",
  taxRate: 0.18,
  taxAmount: 5.90, // from hardcoded Rs 5.90 in TaxTheme1Preview
  roundOff: false,
  roundOffAmount: 0,
  grandTotal: 45.80, // from hardcoded total
  received: 12.00,
  balance: 33.80,
  description: "Sale Description",
  termsAndConditions: "Thanks for doing business with us!",
  lineItems: [
    {
      id: 1,
      name: "ITEM 1",
      quantity: 1,
      unit: "NONE",
      price: 10.00,
      amount: 10.40, // 10 + 0.5 tax - 0.1 discount based on the hardcoded table
    },
    {
      id: 2,
      name: "ITEM 2",
      quantity: 1,
      unit: "NONE",
      price: 30.00,
      amount: 35.40,
    }
  ]
};

export const DUMMY_THERMAL_SALE: BillPreviewSaleData = {
  ...DUMMY_REGULAR_SALE,
  grandTotal: 42.32, // to match whatever thermal is hardcoded if different
};
