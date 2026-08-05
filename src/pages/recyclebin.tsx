import { RecycleBinHeader } from "@/components/pagescomponents/utilities/recyclebin/RecycleBinHeader";

export function RecycleBin() {
  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        <RecycleBinHeader />
      </div>
    </div>
  );
}
