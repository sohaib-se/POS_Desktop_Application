import { Trash2 } from "lucide-react";

export function RecycleBinHeader() {
  return (
    <div className="text-center py-12">
      <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Recycle Bin</h3>
      <p className="text-gray-500">No deleted items found</p>
    </div>
  );
}
