import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecycleBinHeaderProps {
  onEmptyTrash?: () => void;
}

export function RecycleBinHeader({ onEmptyTrash }: RecycleBinHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 bg-white mb-2">
      <h1 className="text-xl font-semibold text-gray-700">Recycle Bin</h1>
      <Button variant="ghost" className="text-gray-500 hover:text-red-500" onClick={onEmptyTrash}>
        <Trash2 className="w-4 h-4 mr-2" />
        Empty Trash
      </Button>
    </div>
  );
}
