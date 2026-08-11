// ─── Printer Configuration ────────────────────────────────────────────────────

export type PrinterCategory = "label" | "regular";
export type PrinterType = "generic" | "tvs_tsc" | "kores";

export interface PrinterSettings {
  category: PrinterCategory;
  type: PrinterType;
  sizeId: string;
  customSize?: CustomLabelSize;
}

export interface CustomLabelSize {
  widthMm: number;
  heightMm: number;
  columns: number;
  labelGapMm: number;
}

// ─── Label Sizes ─────────────────────────────────────────────────────────────

export interface LabelSize {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  /** Number of labels per row (columns in print grid) */
  columns: number;
  /** Max labels per page before a forced page-break */
  perPage: number;
}

export const LABEL_PRINTER_SIZES: LabelSize[] = [
  { id: "2x50x25",   name: "2 Labels (50x25mm)",  widthMm: 50,  heightMm: 25, columns: 2, perPage: 20 },
  { id: "1x100x50",  name: "1 Label (100x50mm)",  widthMm: 100, heightMm: 50, columns: 1, perPage: 10 },
  { id: "1x50x25",   name: "1 Label (50x25mm)",   widthMm: 50,  heightMm: 25, columns: 1, perPage: 10 },
  { id: "2x38x25",   name: "2 Labels (38x25mm)",  widthMm: 38,  heightMm: 25, columns: 2, perPage: 20 },
];

export const REGULAR_PRINTER_SIZES: LabelSize[] = [
  { id: "65x38x21",  name: "65 Labels (38x21mm)", widthMm: 38,  heightMm: 21, columns: 3, perPage: 65 },
  { id: "48x48x24",  name: "48 Labels (48x24mm)", widthMm: 48,  heightMm: 24, columns: 3, perPage: 48 },
  { id: "24x64x34",  name: "24 Labels (64x34mm)", widthMm: 64,  heightMm: 34, columns: 2, perPage: 24 },
  { id: "12x100x44", name: "12 Labels (100x44mm)",widthMm: 100, heightMm: 44, columns: 1, perPage: 12 },
];

export const ALL_LABEL_SIZES: LabelSize[] = [
  ...LABEL_PRINTER_SIZES,
  ...REGULAR_PRINTER_SIZES,
];

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  category: "label",
  type: "generic",
  sizeId: "2x50x25",
};

export function getLabelSize(settings: PrinterSettings): LabelSize {
  const sizes = settings.category === "label" ? LABEL_PRINTER_SIZES : REGULAR_PRINTER_SIZES;
  return sizes.find((s) => s.id === settings.sizeId) ?? sizes[0];
}

export function getSizeDisplayName(settings: PrinterSettings): string {
  if (settings.sizeId === "custom" && settings.customSize) {
    const c = settings.customSize;
    return `Custom (${c.widthMm}x${c.heightMm}mm)`;
  }
  return getLabelSize(settings).name;
}

// ─── Active Fields ────────────────────────────────────────────────────────────

export interface ActiveFields {
  salePrice: boolean;
  companyName: boolean;
  itemName: boolean;
  discount: boolean;
}

export const DEFAULT_ACTIVE_FIELDS: ActiveFields = {
  salePrice: true,
  companyName: true,
  itemName: true,
  discount: true,
};
