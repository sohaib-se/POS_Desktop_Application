import { ImportItemsHeader } from "@/components/pagescomponents/utilities/importitems/ImportItemsHeader";
import { ImportItemsSteps } from "@/components/pagescomponents/utilities/importitems/ImportItemsSteps";
import { ImportItemsUpload } from "@/components/pagescomponents/utilities/importitems/ImportItemsUpload";

export function ImportItems() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <ImportItemsHeader />
        <div className="grid grid-cols-2 gap-8">
          <ImportItemsSteps />
          <ImportItemsUpload />
        </div>
      </div>
    </div>
  );
}
