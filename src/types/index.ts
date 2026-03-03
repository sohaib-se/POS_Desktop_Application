import type { ReactNode } from "react";

export interface Party {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  type: 'customer' | 'supplier' | 'both';
}

export interface Item {
  id: string;
  name: string;
  code?: string;
  category?: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  unit: string;
  stockValue?: number;
  minStock?: number;
  location?: string;
}

export interface Transaction {
  quantity: ReactNode;
  id: string;
  type: 'Sale' | 'Purchase' | 'Payment-In' | 'Payment-Out' | 'Estimate' | 'Credit Note' | 'Debit Note' | 'PoS Sale';
  invoiceNo?: string;
  referenceNo?: string;
  date: string;
  partyName: string;
  amount: number;
  balance: number;
  paymentType?: string;
  status?: 'Paid' | 'Unpaid' | 'Open' | 'Cancelled';
  items?: Array<{
    id: string;
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    amount: number;
  }>;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber?: string;
  bankName?: string;
  balance: number;
  type: 'bank' | 'cash' | 'loan';
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
}

export interface Unit {
  id: string;
  fullName: string;
  shortName: string;
  conversion?: {
    baseUnit: string;
    secondaryUnit: string;
    rate: number;
  };
}

export interface Estimate {
  id: string;
  referenceNo: string;
  date: string;
  partyName: string;
  amount: number;
  balance: number;
  status: 'Open' | 'Converted' | 'Closed';
}

export interface PaymentIn {
  id: string;
  receiptNo: string;
  date: string;
  partyName: string;
  amount: number;
  paymentType: string;
  reference?: string;
}

export interface PurchaseBill {
  id: string;
  invoiceNo: string;
  date: string;
  partyName: string;
  amount: number;
  balance: number;
  paymentType: string;
  status: 'Paid' | 'Unpaid';
}

export interface Report {
  id: string;
  name: string;
  description?: string;
}

export interface UserSettings {
  businessName: string;
  phone: string;
  email?: string;
  address?: string;
  businessType?: string;
  category?: string;
  pincode?: string;
  logo?: string;
  signature?: string;
  currency: string;
  decimalPlaces: number;
  autoBackup: boolean;
  backupFrequency: number;
  transactionHistory: boolean;
}

export type ViewType = 
  | 'home' 
  | 'parties' 
  | 'items' 
  | 'sale-invoices' 
  | 'estimates' 
  | 'payment-in' 
  | 'sale-return'
  | 'pos'
  | 'purchase-bills'
  | 'payment-out'
  | 'expenses'
  | 'purchase-return'
  | 'bank-accounts'
  | 'cash-in-hand'
  | 'cheques'
  | 'loan-accounts'
  | 'reports'
  | 'sync-share'
  | 'sync-auto-backup'
  | 'sync-backup-computer'
  | 'sync-backup-drive'
  | 'sync-restore-backup'
  | 'settings'
  | 'utilities'
  | 'utilities-import-items'
  | 'utilities-barcode'
  | 'utilities-bulk-update'
  | 'utilities-import-parties'
  | 'utilities-export-tally'
  | 'utilities-export-items'
  | 'utilities-verify-data'
  | 'utilities-recycle-bin'
  | 'edit-profile';
