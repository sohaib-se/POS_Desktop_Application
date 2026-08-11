import { useMemo } from "react";
import JsBarcode from "jsbarcode";
import type { BarcodeFormData } from "./BarcodeGeneratorForm";
import type { Item } from "@/types";

interface BarcodeLabelProps {
  formData: BarcodeFormData;
  className?: string;
  items?: Item[];
  companyName?: string;
  /** Physical label width in mm — applied during @media print */
  widthMm?: number;
  /** Physical label height in mm — applied during @media print */
  heightMm?: number;
}

/**
 * Generates a barcode SVG string synchronously.
 * We use this approach (vs. useEffect + ref) so that react-to-print
 * captures the barcode content when it clones the DOM into its print iframe.
 */
function generateBarcodeSvg(value: string): string {
  try {
    // Create a detached SVG element, let JsBarcode render into it, then take the outerHTML
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, value || "0", {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      background: "transparent",
      lineColor: "#000000",
      width: 1.5,
      height: 36,
      valid: () => true,
    });
    svg.setAttribute("width", "100%");
    svg.setAttribute("style", "max-width:100%; display:block;");
    return svg.outerHTML;
  } catch {
    return "";
  }
}

export function BarcodeLabel({
  formData,
  className = "",
  items = [],
  companyName = "",
  widthMm,
  heightMm,
}: BarcodeLabelProps) {
  const selectedItem = items.find((i) => i.name === formData.itemName);

  const resolveValue = (fieldVal: string): string | null => {
    if (!fieldVal) return null;
    switch (fieldVal) {
      case "Company Name":
        return companyName || "Company Name";
      case "Item Name":
        return formData.itemName || "Item Name";
      case "Sale Price":
        return selectedItem != null ? `Rs. ${selectedItem.salePrice}` : "Sale Price";
      case "Discount":
        return "N/A";
      default:
        return fieldVal || null;
    }
  };

  const headerVal = resolveValue(formData.header);
  const l1 = resolveValue(formData.line1);
  const l2 = resolveValue(formData.line2);
  const l3 = resolveValue(formData.line3);
  const l4 = resolveValue(formData.line4);

  const barcodeValue = formData.itemCode?.trim() || "000000000000";

  // Generate the SVG string once and memoize it.
  // Because it's in the React render tree (via dangerouslySetInnerHTML),
  // react-to-print correctly captures it when printing.
  const barcodeSvgHtml = useMemo(
    () => generateBarcodeSvg(barcodeValue),
    [barcodeValue]
  );

  // mm sizes are applied only during @media print via the .barcode-label class
  // in BarcodeGenerateModal's inline <style>. On screen we let flexbox size it.
  const printStyle =
    widthMm && heightMm
      ? ({
          "--label-w": `${widthMm}mm`,
          "--label-h": `${heightMm}mm`,
        } as React.CSSProperties)
      : {};

  return (
    <div
      className={`barcode-label border border-dashed border-gray-300 rounded-lg p-2 bg-white flex flex-col items-center justify-start overflow-hidden break-inside-avoid ${className}`}
      style={printStyle}
    >
      {/* Header */}
      {headerVal && (
        <p className="text-[10px] font-bold text-gray-800 mb-0.5 text-center leading-tight w-full truncate">
          {headerVal}
        </p>
      )}

      {/* Barcode SVG — embedded directly in the render tree */}
      <div
        className="w-full flex items-center justify-center my-0.5"
        dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
      />

      {/* Barcode number */}
      {barcodeValue && barcodeValue !== "000000000000" && (
        <p className="text-[8px] font-bold text-gray-900 mb-0.5 text-center tracking-wider">
          {barcodeValue}
        </p>
      )}

      {/* Lines */}
      {(l1 || l2 || l3 || l4) && (
        <div className="flex flex-col items-center w-full text-center gap-px">
          {l1 && <p className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">{l1}</p>}
          {l2 && <p className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">{l2}</p>}
          {l3 && <p className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">{l3}</p>}
          {l4 && <p className="text-[9px] font-semibold text-gray-700 truncate w-full text-center">{l4}</p>}
        </div>
      )}
    </div>
  );
}
