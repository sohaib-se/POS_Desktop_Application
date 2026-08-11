import type { BarcodeFormData } from "./BarcodeGeneratorForm";
import type { Item } from "@/types";

interface BarcodeLabelProps {
  formData: BarcodeFormData;
  className?: string;
  items?: Item[];
  companyName?: string;
}

export function BarcodeLabel({ formData, className = "", items = [], companyName = "" }: BarcodeLabelProps) {
  const selectedItem = items.find(i => i.name === formData.itemName);

  const resolveValue = (fieldVal: string) => {
    if (!fieldVal) return null;
    switch (fieldVal) {
      case "Company Name":
        return companyName || "Company Name";
      case "Item Name":
        return formData.itemName || "Item Name";
      case "Sale Price":
        return selectedItem ? `$${selectedItem.salePrice}` : "Sale Price";
      case "Discount":
        return "N/A"; // No discount column in items
      default:
        return fieldVal;
    }
  };

  const headerVal = resolveValue(formData.header);
  const l1 = resolveValue(formData.line1);
  const l2 = resolveValue(formData.line2);
  const l3 = resolveValue(formData.line3);
  const l4 = resolveValue(formData.line4);

  return (
    <div className={`border border-dashed border-gray-300 rounded-xl p-6 bg-white shadow-sm flex flex-col items-center min-w-[250px] ${className}`}>
      <p className="text-sm font-bold text-gray-800 mb-2 text-center">
        {headerVal || "Header"}
      </p>

      {/* Placeholder Barcode */}
      <div className="w-full h-14 flex items-center justify-center mb-1">
        <div className="flex gap-[2px]">
          {Array.from({ length: 35 }).map((_, i) => {
            const height = i % 4 === 0 ? "h-10" : (i % 3 === 0 ? "h-8" : "h-12");
            const width = i % 5 === 0 ? "w-1" : "w-0.5";
            return (
              <div
                key={i}
                className={`${width} ${height} bg-black`}
              ></div>
            );
          })}
        </div>
      </div>

      <p className="text-xs font-bold text-gray-900 mb-2 text-center">
        {formData.itemCode || "Item Code"}
      </p>

      <div className="flex flex-col items-center text-[11px] font-semibold text-gray-700 leading-tight">
        {l1 && <p>{l1}</p>}
        {l2 && <p>{l2}</p>}
        {l3 && <p>{l3}</p>}
        {l4 && <p>{l4}</p>}
      </div>
    </div>
  );
}
