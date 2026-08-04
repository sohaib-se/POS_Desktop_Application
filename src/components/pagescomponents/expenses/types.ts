import type { ReactNode } from "react";
import type { ExpenseCategory } from "@/types";

export interface ExpenseItem {
  id: string;
  name: string;
  price: number;
  category_id?: string;
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
