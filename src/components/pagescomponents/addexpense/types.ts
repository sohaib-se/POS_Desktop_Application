export interface ExpenseRow {
  id: number;
  categoryId: string;
  category: string;
  note: string;
  paymentType: string;
  amount: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  category_id?: string;
}

export interface ExpenseTab {
  id: number;
  label: string;
  expenseCategoryId: string;
  expenseDate: string;
  paymentType: string;
  roundOff: boolean;
  rows: ExpenseRow[];
  description: string;
  showDescriptionInput: boolean;
  imageDataUrl: string;
  imageFileName: string;
  documentDataUrl: string;
  documentFileName: string;
}
