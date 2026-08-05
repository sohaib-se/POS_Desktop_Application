import type { CategoryRecord } from "@/components/pagescomponents/items/products/types";

export type CategoryContextMenuState = {
  category: CategoryRecord;
  x: number;
  y: number;
};

export type ItemRecord = {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
};
