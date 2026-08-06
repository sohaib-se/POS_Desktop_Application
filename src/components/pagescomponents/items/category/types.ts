import type { CategoryRecord, Item } from "@/components/pagescomponents/items/products/types";

export type CategoryContextMenuState = {
  category: CategoryRecord;
  x: number;
  y: number;
};

export type ItemRecord = Item;
