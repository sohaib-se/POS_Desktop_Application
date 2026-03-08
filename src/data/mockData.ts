import type { Party, Item, Transaction, ExpenseCategory, BankAccount, Category, Unit, Estimate, PaymentIn, PurchaseBill } from '@/types';

export const parties: Party[] = [
  { id: 1, name: 'Khan', phone: '91312314', email: 'msohaibkhan34@gmail.com', balance: 100, type: 'customer' },
  { id: 2, name: 'sfe', phone: '031928123', balance: 0, type: 'customer' },
  { id: 3, name: 'Sohaib', phone: '031928123', balance: 0, type: 'customer' },
  { id: 4, name: 'Cash Sale', phone: '', balance: 200, type: 'customer' },
  { id: 5, name: 'Walking Customer', phone: '3129953944', balance: 0, type: 'customer' },
];

export const items: Item[] = [
  { id: '1', name: 'Book', code: '123456', category: 'Stationary', salePrice: 200, purchasePrice: 100, stockQuantity: 492, unit: 'Pcs', stockValue: 49200 },
  { id: '2', name: 'clipper', category: 'Stationary', salePrice: 200, purchasePrice: 150, stockQuantity: 40, unit: 'Box', stockValue: 5760 },
  { id: '3', name: 'jkh', category: 'doller', salePrice: 0, purchasePrice: 0, stockQuantity: 0, unit: 'Box', stockValue: 0 },
  { id: '4', name: 'Pencil', category: 'Stationary', salePrice: 20, purchasePrice: 10, stockQuantity: 189, unit: 'Pcs', stockValue: 3780 },
];

export const transactions: Transaction[] = [
  { id: '1', type: 'Sale', invoiceNo: '7', date: '21/02/2026', partyName: 'Cash Sale', amount: 200, balance: 200, paymentType: 'Cash', status: 'Unpaid' },
  { id: '2', type: 'Sale', invoiceNo: '8', date: '21/02/2026', partyName: 'Khan', amount: 200, balance: 200, paymentType: 'Cash', status: 'Unpaid' },
  { id: '3', type: 'Estimate', invoiceNo: '3', date: '21/02/2026', partyName: 'Khan', amount: 200, balance: 200, status: 'Open' },
  { id: '4', type: 'Estimate', invoiceNo: '4', date: '21/02/2026', partyName: 'Sohaib', amount: 200, balance: 200, status: 'Open' },
  { id: '5', type: 'Purchase', invoiceNo: '1', date: '21/02/2026', partyName: 'Khan', amount: 100, balance: 100, paymentType: 'Cash', status: 'Unpaid' },
  { id: '6', type: 'PoS Sale', invoiceNo: '5', date: '19/02/2026', partyName: 'Cash Sale', amount: 600, balance: 0, paymentType: 'Cash', status: 'Paid' },
  { id: '7', type: 'Estimate', invoiceNo: '2', date: '02/02/2026', partyName: 'Walking Customer', amount: 200, balance: 200, status: 'Open' },
  { id: '8', type: 'PoS Sale', invoiceNo: '4', date: '02/02/2026', partyName: 'Cash Sale', amount: 200, balance: 0, paymentType: 'Cash', status: 'Paid' },
  { id: '9', type: 'Sale', invoiceNo: '9', date: '21/02/2026', partyName: 'Khan', amount: 160, balance: 160, paymentType: 'Cash', status: 'Unpaid' },
  { id: '10', type: 'Sale', invoiceNo: '6', date: '20/02/2026', partyName: 'Sohaib', amount: 160, balance: 160, paymentType: 'Cash', status: 'Unpaid' },
];

export const saleInvoices = [
  { id: '1', invoiceNo: '9', date: '21/02/2026', partyName: 'Khan', transaction: 'Sale', paymentType: 'Cash', amount: 160, balance: 160 },
  { id: '2', invoiceNo: '8', date: '21/02/2026', partyName: 'Khan', transaction: 'Sale', paymentType: 'Cash', amount: 200, balance: 200 },
  { id: '3', invoiceNo: '7', date: '21/02/2026', partyName: 'Cash Sale', transaction: 'Sale', paymentType: 'Cash', amount: 200, balance: 200 },
  { id: '4', invoiceNo: '6', date: '20/02/2026', partyName: 'Sohaib', transaction: 'Sale', paymentType: 'Cash', amount: 160, balance: 160 },
];

export const estimates: Estimate[] = [
  { id: '1', referenceNo: '4', date: '21/02/2026', partyName: 'Sohaib', amount: 560, balance: 560, status: 'Open' },
  { id: '2', referenceNo: '3', date: '21/02/2026', partyName: 'Khan', amount: 560, balance: 560, status: 'Open' },
  { id: '3', referenceNo: '2', date: '02/02/2026', partyName: 'Walking Customer', amount: 220, balance: 220, status: 'Open' },
];

export const paymentInRecords: PaymentIn[] = [
  { id: '1', receiptNo: '4', date: '21/02/2026', partyName: 'Khan', amount: 360, paymentType: 'Cash' },
  { id: '2', receiptNo: '3', date: '21/02/2026', partyName: 'Sohaib', amount: 160, paymentType: 'Cash' },
  { id: '3', receiptNo: '2', date: '02/02/2026', partyName: 'Walking Customer', amount: 1200, paymentType: 'Cash' },
  { id: '4', receiptNo: '1', date: '19/02/2026', partyName: 'Walking Customer', amount: 600, paymentType: 'Cash' },
];

export const purchaseBills: PurchaseBill[] = [
  { id: '1', invoiceNo: '3', date: '21/02/2026', partyName: 'Khan', amount: 100, balance: 100, paymentType: 'Cash', status: 'Unpaid' },
  { id: '2', invoiceNo: '2', date: '05/02/2026', partyName: 'sfe', amount: 2880, balance: 2880, paymentType: 'Cash', status: 'Unpaid' },
];

export const paymentOutRecords = [
  { id: '1', date: '21/02/2026', partyName: 'Walking Customer', amount: 400, paymentType: 'Cash' },
  { id: '2', date: '20/02/2026', partyName: 'Walking Customer', amount: 2000, paymentType: 'Cash' },
  { id: '3', date: '19/02/2026', partyName: 'sfe', amount: 2880, paymentType: 'Cash' },
];

export const expenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Petrol', amount: 0 },
  { id: '2', name: 'Rent', amount: 0 },
  { id: '3', name: 'Salary', amount: 0 },
  { id: '4', name: 'Tea', amount: 0 },
  { id: '5', name: 'Transport', amount: 0 },
  { id: '6', name: 'Travel', amount: 500 },
];

export const bankAccounts: BankAccount[] = [];

export const cashInHandTransactions = [
  { id: '1', date: '21/02/2026', name: 'Walking Customer', type: 'Payment-Out', amount: 400 },
  { id: '2', date: '21/02/2026', name: 'Khan', type: 'Payment-In', amount: 360 },
  { id: '3', date: '21/02/2026', name: 'Sohaib', type: 'Payment-In', amount: 160 },
  { id: '4', date: '20/02/2026', name: 'Walking Customer', type: 'Payment-Out', amount: 2000 },
  { id: '5', date: '19/02/2026', name: 'Cash (Travel)', type: 'Payment-Out', amount: 500 },
  { id: '6', date: '19/02/2026', name: 'Cash Sale', type: 'Payment-In', amount: 600 },
  { id: '7', date: '19/02/2026', name: 'sfe', type: 'Payment-Out', amount: 2880 },
];

export const categories: Category[] = [
  { id: '1', name: 'doller', itemCount: 5 },
  { id: '2', name: 'grocery', itemCount: 2 },
  { id: '3', name: 'Stationary', itemCount: 4 },
];

export const units: Unit[] = [
  { id: '1', fullName: 'BAGS', shortName: 'Bag' },
  { id: '2', fullName: 'BOTTLES', shortName: 'Btl' },
  { id: '3', fullName: 'BOX', shortName: 'Box', conversion: { baseUnit: 'BOX', secondaryUnit: 'PIECES', rate: 10 } },
  { id: '4', fullName: 'BUNDLES', shortName: 'Bdl' },
  { id: '5', fullName: 'CANS', shortName: 'Can' },
  { id: '6', fullName: 'CARTONS', shortName: 'Ctn' },
  { id: '7', fullName: 'DOZENS', shortName: 'Dzn' },
  { id: '8', fullName: 'GRAMMES', shortName: 'Gm' },
  { id: '9', fullName: 'KILOGRAMS', shortName: 'Kg' },
  { id: '10', fullName: 'LITRE', shortName: 'Ltr' },
  { id: '11', fullName: 'METERS', shortName: 'Mtr' },
  { id: '12', fullName: 'MILILITRE', shortName: 'Ml' },
  { id: '13', fullName: 'NUMBERS', shortName: 'Nos' },
  { id: '14', fullName: 'PIECES', shortName: 'Pcs' },
];

export const reports = [
  { id: '1', name: 'Sale', description: 'Transaction report' },
  { id: '2', name: 'Purchase', description: 'Purchase transactions' },
  { id: '3', name: 'Day book', description: 'Daily transactions' },
  { id: '4', name: 'All Transactions', description: 'Complete transaction history' },
  { id: '5', name: 'Profit And Loss', description: 'Financial summary' },
  { id: '6', name: 'Bill Wise Profit', description: 'Profit per bill' },
  { id: '7', name: 'Cash flow', description: 'Cash movement' },
  { id: '8', name: 'Trial Balance Report', description: 'Account balances' },
  { id: '9', name: 'Balance Sheet', description: 'Financial position' },
  { id: '10', name: 'Party report', description: 'Party-wise summary' },
  { id: '11', name: 'Party Statement', description: 'Detailed party transactions' },
  { id: '12', name: 'Party wise Profit & Loss', description: 'Profit by party' },
  { id: '13', name: 'All parties', description: 'Complete party list' },
  { id: '14', name: 'Party Report By Item', description: 'Items by party' },
  { id: '15', name: 'Sale Purchase By Party', description: 'Sales & purchases' },
  { id: '16', name: 'Sale Purchase By Party Group', description: 'Grouped by party' },
];

export const chartData = [
  { date: '1 Feb', value: 200 },
  { date: '4 Feb', value: 0 },
  { date: '7 Feb', value: 0 },
  { date: '10 Feb', value: 0 },
  { date: '13 Feb', value: 0 },
  { date: '16 Feb', value: 600 },
  { date: '19 Feb', value: 0 },
  { date: '22 Feb', value: 520 },
  { date: '25 Feb', value: 0 },
  { date: '28 Feb', value: 0 },
];

export const userSettings = {
  businessName: 'Laimsoft',
  phone: '3198224949',
  email: '',
  address: '',
  businessType: 'Retail',
  category: 'Book / Stationary store',
  pincode: '',
  logo: '',
  signature: '',
  currency: 'Rs',
  decimalPlaces: 2,
  autoBackup: true,
  backupFrequency: 2,
  transactionHistory: true,
};
