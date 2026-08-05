import { ExportItemsHeader } from "@/components/pagescomponents/utilities/exportitems/ExportItemsHeader";

export function ExportItems() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <ExportItemsHeader />
      </div>
    </div>
  );
}
