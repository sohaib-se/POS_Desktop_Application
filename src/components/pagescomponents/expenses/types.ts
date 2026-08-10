import type { ReactNode } from "react";
import type { ExpenseCategory } from "@/types";

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  category_id?: string;
}

export interface ExpenseRecord {
  id: string;
  expense_no: string | null;
  category_id: string | null;
  category_name: string | null;
  amount: number;
  payment_type: string;
  description: string | null;
  line_items_json: string | null;
  round_off: number;
  round_off_amount: number;
  created_at: string;
  updated_at: string;
}


export type ExpenseCategoryContextMenuState = {
  category: ExpenseCategory;
  x: number;
  y: number;
};

export type ExpenseItemContextMenuState = {
  item: ExpenseItem;
  x: number;
  y: number;
};

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export type DialogContentProps = {
  children: ReactNode;
  className?: string;
};

export type DialogHeaderProps = {
  children: ReactNode;
};

export type DialogTitleProps = {
  children: ReactNode;
  className?: string;
};
