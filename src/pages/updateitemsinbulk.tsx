import { BulkUpdateHeader } from "@/components/pagescomponents/utilities/updateitemsinbulk/BulkUpdateHeader";
import { BulkUpdateTable } from "@/components/pagescomponents/utilities/updateitemsinbulk/BulkUpdateTable";

export function UpdateItemsInBulk() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <BulkUpdateHeader />
        <BulkUpdateTable />
      </div>
    </div>
  );
}
