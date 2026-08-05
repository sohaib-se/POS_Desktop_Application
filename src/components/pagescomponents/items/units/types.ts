import type { UnitRecord, ConversionRateRecord } from "@/components/pagescomponents/items/products/types";

export type UnitContextMenuState = {
  unit: UnitRecord;
  x: number;
  y: number;
};

export type ConversionContextMenuState = {
  conversion: ConversionRateRecord;
  x: number;
  y: number;
};
