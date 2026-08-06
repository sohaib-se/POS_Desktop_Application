import { ExportItemsHeader } from "@/components/pagescomponents/utilities/exportitems/ExportItemsHeader";

export function ExportItems() {
  return (
    <div className="h-full bg-gray-50 flex flex-col items-center pt-6">
      <div className="w-full max-w-xl px-4">
        <ExportItemsHeader />
      </div>
    </div>
  );
}
