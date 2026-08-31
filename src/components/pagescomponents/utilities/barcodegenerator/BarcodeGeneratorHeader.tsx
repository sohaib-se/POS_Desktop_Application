import { Info, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type PrinterSettings,
  type ActiveFields,
  LABEL_PRINTER_SIZES,
  REGULAR_PRINTER_SIZES,
  getSizeDisplayName,
  getLabelSize,
} from "./barcodeTypes";

interface BarcodeGeneratorHeaderProps {
  printerSettings: PrinterSettings;
  setPrinterSettings: React.Dispatch<React.SetStateAction<PrinterSettings>>;
  activeFields: ActiveFields;
  setActiveFields: React.Dispatch<React.SetStateAction<ActiveFields>>;
}

export function BarcodeGeneratorHeader({
  printerSettings,
  setPrinterSettings,
  activeFields,
  setActiveFields,
}: BarcodeGeneratorHeaderProps) {
  const currentSize = getLabelSize(printerSettings);
  const printerLabel = printerSettings.category === "label" ? "Label Printer" : "Regular Printer";

  const handleCategoryChange = (val: string) => {
    const category = val as "label" | "regular";
    const newSizes = category === "label" ? LABEL_PRINTER_SIZES : REGULAR_PRINTER_SIZES;
    setPrinterSettings((prev) => ({
      ...prev,
      category,
      sizeId: newSizes[0].id,
    }));
  };

  const handleSizeChange = (val: string) => {
    setPrinterSettings((prev) => ({ ...prev, sizeId: val }));
  };

  const handleTypeChange = (val: string) => {
    setPrinterSettings((prev) => ({ ...prev, type: val as "generic" | "tvs_tsc" | "kores" }));
  };

  const sizes = printerSettings.category === "label" ? LABEL_PRINTER_SIZES : REGULAR_PRINTER_SIZES;

  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-[#3B4256]">Barcode Generator</h3>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>
          Printer: <span className="text-gray-700 font-medium">{printerLabel}</span>
        </span>
        <span>
          Size: <span className="text-gray-700 font-medium">{getSizeDisplayName(printerSettings)}</span>
        </span>
        <div className="h-6 w-px bg-gray-300"></div>

        <Sheet>
          <SheetTrigger asChild>
            <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[400px] sm:w-[450px] p-0 flex flex-col h-full bg-white"
          >
            <SheetHeader className="px-6 py-4 border-b border-gray-200">
              <SheetTitle className="text-[#4B5563] text-lg font-semibold">
                Barcode Settings
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">

                {/* ── Printer Category ──────────────────────────── */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Printer</span>
                    <span className="text-gray-500 text-sm italic">Select any 1 option</span>
                  </div>
                  <RadioGroup
                    value={printerSettings.category}
                    onValueChange={handleCategoryChange}
                    className="space-y-3 pl-1"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="label"
                        id="cat-label"
                        className="border-gray-300 text-blue-500 fill-blue-500"
                      />
                      <Label htmlFor="cat-label" className="text-gray-600 font-normal cursor-pointer">
                        Label Printer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="regular"
                        id="cat-regular"
                        className="border-gray-300 text-blue-500 fill-blue-500"
                      />
                      <Label htmlFor="cat-regular" className="text-gray-600 font-normal cursor-pointer">
                        Regular Printer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* ── Printer Type (Brand) ──────────────────────── */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Printer Type</span>
                    <span className="text-gray-500 text-sm italic">Select any 1 option</span>
                  </div>
                  <RadioGroup
                    value={printerSettings.type}
                    onValueChange={handleTypeChange}
                    className="space-y-3 pl-1"
                  >
                    {(["generic", "tvs_tsc", "kores"] as const).map((t) => (
                      <div key={t} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={t}
                          id={`type-${t}`}
                          className="border-gray-300 text-blue-500 fill-blue-500"
                        />
                        <Label htmlFor={`type-${t}`} className="text-gray-600 font-normal cursor-pointer">
                          {t === "generic" ? "GENERIC" : t === "tvs_tsc" ? "TVS/TSC" : "KORES"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* ── Label Size ────────────────────────────────── */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Size</span>
                    <span className="text-gray-500 text-sm italic">Select any 1 option</span>
                  </div>
                  <RadioGroup
                    value={printerSettings.sizeId}
                    onValueChange={handleSizeChange}
                    className="space-y-4 pl-1"
                  >
                    {sizes.map((s) => (
                      <div key={s.id} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={s.id}
                          id={`size-${s.id}`}
                          className="border-gray-300 text-blue-500 fill-blue-500"
                        />
                        <Label
                          htmlFor={`size-${s.id}`}
                          className="text-gray-700 font-normal cursor-pointer"
                        >
                          {s.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Custom size — label printers only */}
                  {printerSettings.category === "label" && (
                    <div className="mt-4 flex items-center gap-2 pl-2 cursor-pointer group">
                      <span className="text-blue-500 font-medium hover:underline text-sm">
                        Create Custom Size
                      </span>
                      <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  )}
                </div>

                {/* ── Additional Fields ─────────────────────────── */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Additional Fields</span>
                  </div>
                  <div className="space-y-4 pl-1">
                    {(
                      [
                        { key: "companyName", label: "Company Name" },
                        { key: "itemName",    label: "Item Name"    },
                        { key: "salePrice",   label: "Sale Price"   },
                        { key: "discount",    label: "Discount"     },
                      ] as const
                    ).map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <Checkbox
                          id={`field-${key}`}
                          checked={activeFields[key]}
                          onCheckedChange={(c) =>
                            setActiveFields((f) => ({ ...f, [key]: c === true }))
                          }
                          className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label
                          htmlFor={`field-${key}`}
                          className="text-gray-600 font-normal cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Invisible element: shows currently selected size label for screen readers */}
      <div className="sr-only" aria-live="polite">
        {printerLabel}, {currentSize.name}
      </div>
    </div>
  );
}
