import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { BarcodeLabel } from "./BarcodeLabel";
import type { BarcodeItem } from "./BarcodeGeneratorItemList";
import type { Item } from "@/types";
import type { LabelSize } from "./barcodeTypes";
import JsBarcode from "jsbarcode";

interface BarcodeGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BarcodeItem[];
  allItems?: Item[];
  companyName?: string;
  labelSize?: LabelSize;
}

const DEFAULT_SIZE: LabelSize = {
  id: "2x50x25",
  name: "2 Labels (50x25mm)",
  widthMm: 50,
  heightMm: 25,
  columns: 2,
  perPage: 20,
};

// ─── Helpers used for generating the print document HTML ─────────────────────

function buildBarcodeSvg(value: string): string {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    JsBarcode(svg, value || "0", {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      background: "transparent",
      lineColor: "#000000",
      width: 1.5,
      height: 32,
      valid: () => true,
    });
    svg.setAttribute("width", "100%");
    svg.setAttribute("style", "display:block; max-width:100%; height:auto;");
    return svg.outerHTML;
  } catch {
    return "";
  }
}

function resolveField(
  fieldVal: string,
  item: BarcodeItem,
  allItems: Item[],
  companyName: string
): string {
  if (!fieldVal) return "";
  const found = allItems.find((i) => i.name === item.itemName);
  switch (fieldVal) {
    case "Company Name": return companyName || "";
    case "Item Name":    return item.itemName || "";
    case "Sale Price":   return found ? `Rs. ${found.salePrice}` : "";
    case "Discount":     return "N/A";
    default:             return fieldVal;
  }
}

function buildLabelHtml(
  item: BarcodeItem,
  allItems: Item[],
  companyName: string,
  size: LabelSize
): string {
  const code    = item.itemCode?.trim() || "";
  const svgHtml = buildBarcodeSvg(code || "000000000000");
  const header  = resolveField(item.header, item, allItems, companyName);
  const l1      = resolveField(item.line1,  item, allItems, companyName);
  const l2      = resolveField(item.line2,  item, allItems, companyName);
  const l3      = resolveField(item.line3,  item, allItems, companyName);
  const l4      = resolveField(item.line4,  item, allItems, companyName);

  const w = size.widthMm;
  const h = size.heightMm;

  return `
    <div style="
      width:${w}mm; height:${h}mm;
      min-width:${w}mm; min-height:${h}mm;
      max-width:${w}mm; max-height:${h}mm;
      border:0.3mm solid #999; border-radius:1mm;
      padding:1.5mm; overflow:hidden;
      display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
      background:white; page-break-inside:avoid; break-inside:avoid;
      box-sizing:border-box;
    ">
      ${header ? `<p style="font-size:6.5pt;font-weight:700;text-align:center;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;margin-bottom:0.5mm;">${header}</p>` : ""}
      <div style="width:100%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;">
        ${svgHtml}
      </div>
      ${code ? `<p style="font-size:6pt;font-weight:700;text-align:center;letter-spacing:0.3pt;margin:0.3mm 0;">${code}</p>` : ""}
      ${l1 ? `<p style="font-size:6pt;font-weight:600;text-align:center;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${l1}</p>` : ""}
      ${l2 ? `<p style="font-size:6pt;font-weight:600;text-align:center;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${l2}</p>` : ""}
      ${l3 ? `<p style="font-size:6pt;font-weight:600;text-align:center;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${l3}</p>` : ""}
      ${l4 ? `<p style="font-size:6pt;font-weight:600;text-align:center;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${l4}</p>` : ""}
    </div>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BarcodeGenerateModal({
  open,
  onOpenChange,
  items,
  allItems = [],
  companyName = "",
  labelSize,
}: BarcodeGenerateModalProps) {
  const size = labelSize ?? DEFAULT_SIZE;

  // Expand each BarcodeItem N times
  const allLabels = items.flatMap((item, idx) => {
    const count = Math.max(1, Math.min(parseInt(item.noOfLabels, 10) || 1, 500));
    return Array.from({ length: count }).map((_, i) => ({
      item,
      key: `${item.id}-${idx}-${i}`,
    }));
  });

  // Group into pages
  const pages: typeof allLabels[] = [];
  for (let i = 0; i < allLabels.length; i += size.perPage) {
    pages.push(allLabels.slice(i, i + size.perPage));
  }

  const totalLabels = allLabels.length;

  // ── Print via hidden iframe — no new tab, triggers OS print dialog ──────────
  const handlePrint = () => {
    const pagesHtml = pages
      .map(
        (pg) => `
        <div style="
          display:grid;
          grid-template-columns:repeat(${size.columns},${size.widthMm}mm);
          gap:2mm; padding:4mm;
          page-break-after:always; break-after:page;
        ">
          ${pg.map(({ item }) => buildLabelHtml(item, allItems, companyName, size)).join("")}
        </div>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Barcode Labels</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; font-family: Arial, sans-serif; }
    @media print {
      @page { margin: 4mm; size: auto; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      div[data-last]:last-child { page-break-after: auto !important; break-after: auto !important; }
    }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

    // Create a hidden 0x0 iframe — no new tab, no popup blocker issues
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);

    const iframeDoc =
      iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.write(html);
    iframeDoc.close();

    const doprint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch { /* ignore */ }
      // Remove iframe after print dialog closes (or after a fallback delay)
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch { /* already removed */ }
      }, 2000);
    };

    if (iframe.contentDocument?.readyState === "complete") {
      setTimeout(doprint, 300);
    } else {
      iframe.onload = () => setTimeout(doprint, 300);
      // Belt-and-suspenders fallback
      setTimeout(doprint, 1000);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] flex flex-col p-0 border-0 bg-transparent shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Generate Barcodes</DialogTitle>
        <div className="bg-white rounded-lg flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-700">Generate</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {totalLabels} label{totalLabels !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{size.name}</span>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Scrollable label preview area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div>
              {pages.map((pageLabels, pageIndex) => (
                <div
                  key={pageIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size.columns}, 1fr)`,
                    gap: "8px",
                    padding: "16px",
                    backgroundColor: "white",
                    marginBottom: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                >
                  {pageLabels.map(({ item, key }) => (
                    <BarcodeLabel
                      key={key}
                      formData={item}
                      items={allItems}
                      companyName={companyName}
                      widthMm={size.widthMm}
                      heightMm={size.heightMm}
                      className="shadow-sm"
                    />
                  ))}
                </div>
              ))}

              {items.length === 0 && (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  No items to generate
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
            <span className="text-xs text-gray-400">
              {pages.length} page{pages.length !== 1 ? "s" : ""} · {totalLabels} labels total
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-8 rounded-full border-gray-300 text-gray-600 font-semibold"
              >
                Save &amp; Close
              </Button>
              <Button
                onClick={handlePrint}
                disabled={totalLabels === 0}
                className="px-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
