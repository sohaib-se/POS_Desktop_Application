import { Info, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export function BarcodeGeneratorHeader({ activeFields, setActiveFields }: any) {
  const [printer, setPrinter] = useState("label-printer");
  const [size, setSize] = useState("2-labels-50x25");

  return (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-[#3B4256]">Barcode Generator</h3>
        <Info className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Printer: <span className="text-gray-700">{printer === "label-printer" ? "Label Printer" : "Regular Printer"}</span></span>
        <span>
          Size: <span className="text-gray-700">
            {size === "2-labels-50x25" && "2 Labels (50x25mm)"}
            {size === "1-label-100x50" && "1 Label (100x50mm)"}
            {size === "1-label-50x25" && "1 Label (50x25mm)"}
            {size === "2-labels-38x25" && "2 Labels (38x25mm)"}
            {size === "65-labels-38x21" && "65 Labels (38x21mm)"}
            {size === "48-labels-48x24" && "48 Labels (48x24mm)"}
            {size === "24-labels-64x34" && "24 Labels (64x34mm)"}
            {size === "12-labels-100x44" && "12 Labels (100x44mm)"}
          </span>
        </span>
        <div className="h-6 w-px bg-gray-300"></div>

        <Sheet>
          <SheetTrigger asChild>
            <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0 flex flex-col h-full bg-white">
            <SheetHeader className="px-6 py-4 border-b border-gray-200">
              <SheetTitle className="text-[#4B5563] text-lg font-semibold">Barcode Settings</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                
                {/* Printer Section */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Printer</span>
                    <span className="text-gray-500 text-sm italic">Select any 1 option</span>
                  </div>
                  <RadioGroup 
                    value={printer} 
                    onValueChange={(val) => {
                      setPrinter(val);
                      // Reset size when switching printer types
                      if (val === "label-printer") setSize("2-labels-50x25");
                      else if (val === "regular-printer") setSize("65-labels-38x21");
                    }} 
                    className="space-y-3 pl-1"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="label-printer" id="label-printer" className="border-gray-300 text-blue-500 fill-blue-500" />
                      <Label htmlFor="label-printer" className="text-gray-600 font-normal">Label Printer</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="regular-printer" id="regular-printer" className="border-gray-300 text-blue-500 fill-blue-500" />
                      <Label htmlFor="regular-printer" className="text-gray-600 font-normal">Regular Printer</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Size Section */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Size</span>
                    <span className="text-gray-500 text-sm italic">Select any 1 option</span>
                  </div>
                  <RadioGroup value={size} onValueChange={setSize} className="space-y-4 pl-1">
                    {printer === "label-printer" ? (
                      <>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="2-labels-50x25" id="size-1" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="size-1" className="text-gray-700 font-normal">2 Labels (50×25mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="1-label-100x50" id="size-2" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="size-2" className="text-gray-700 font-normal">1 Label (100×50mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="1-label-50x25" id="size-3" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="size-3" className="text-gray-700 font-normal">1 Label (50×25mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="2-labels-38x25" id="size-4" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="size-4" className="text-gray-700 font-normal">2 Labels (38×25mm)</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="65-labels-38x21" id="reg-size-1" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="reg-size-1" className="text-gray-700 font-normal">65 Labels (38×21mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="48-labels-48x24" id="reg-size-2" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="reg-size-2" className="text-gray-700 font-normal">48 Labels (48×24mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="24-labels-64x34" id="reg-size-3" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="reg-size-3" className="text-gray-700 font-normal">24 Labels (64×34mm)</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="12-labels-100x44" id="reg-size-4" className="border-gray-300 text-blue-500 fill-blue-500" />
                          <Label htmlFor="reg-size-4" className="text-gray-700 font-normal">12 Labels (100×44mm)</Label>
                        </div>
                      </>
                    )}
                  </RadioGroup>
                  {printer === "label-printer" && (
                    <div className="mt-4 flex items-center gap-2 pl-2 cursor-pointer group">
                      <span className="text-blue-500 font-medium hover:underline text-sm">Create Custom Size</span>
                      <Info className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Additional Fields Section */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mb-4">
                    <span className="font-semibold text-gray-700">Additional Fields</span>
                  </div>
                  <div className="space-y-4 pl-1">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="field-sale" 
                        checked={activeFields.salePrice}
                        onCheckedChange={(c) => setActiveFields((f: any) => ({ ...f, salePrice: c === true }))}
                        className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                      />
                      <Label htmlFor="field-sale" className="text-gray-600 font-normal">Sale Price</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="field-company" 
                        checked={activeFields.companyName}
                        onCheckedChange={(c) => setActiveFields((f: any) => ({ ...f, companyName: c === true }))}
                        className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                      />
                      <Label htmlFor="field-company" className="text-gray-600 font-normal">Company Name</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="field-item" 
                        checked={activeFields.itemName}
                        onCheckedChange={(c) => setActiveFields((f: any) => ({ ...f, itemName: c === true }))}
                        className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                      />
                      <Label htmlFor="field-item" className="text-gray-600 font-normal">Item Name</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="field-discount" 
                        checked={activeFields.discount}
                        onCheckedChange={(c) => setActiveFields((f: any) => ({ ...f, discount: c === true }))}
                        className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                      />
                      <Label htmlFor="field-discount" className="text-gray-600 font-normal">Discount</Label>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
