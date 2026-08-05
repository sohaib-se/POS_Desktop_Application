import { BarcodeGeneratorHeader } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorHeader";
import { BarcodeGeneratorForm } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorForm";
import { BarcodeGeneratorPreview } from "@/components/pagescomponents/utilities/barcodegenerator/BarcodeGeneratorPreview";

export function BarcodeGenerator() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <BarcodeGeneratorHeader />
        <div className="grid grid-cols-2 gap-8">
          <BarcodeGeneratorForm />
          <BarcodeGeneratorPreview />
        </div>
      </div>
    </div>
  );
}
