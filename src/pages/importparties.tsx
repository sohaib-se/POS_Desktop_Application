import { ImportPartiesHeader } from "@/components/pagescomponents/utilities/importparties/ImportPartiesHeader";
import { ImportPartiesActions } from "@/components/pagescomponents/utilities/importparties/ImportPartiesActions";

export function ImportParties() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <ImportPartiesHeader />
          <ImportPartiesActions />
        </div>
      </div>
    </div>
  );
}
