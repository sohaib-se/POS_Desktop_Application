import { useState } from "react";
import { Maximize2, ScanBarcode, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BarcodePreviewModal } from "./BarcodePreviewModal";
import { BarcodeGenerateModal } from "./BarcodeGenerateModal";
import type { Item } from "@/types";

export interface BarcodeItem {
  id: string;
  itemName: string;
  itemCode: string;
  noOfLabels: string;
  header: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
}

interface BarcodeGeneratorItemListProps {
  items: BarcodeItem[];
  allItems?: Item[];
  companyName?: string;
  onDelete?: (id: string) => void;
}

export function BarcodeGeneratorItemList({ items, allItems = [], companyName = "", onDelete }: BarcodeGeneratorItemListProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col border border-gray-200 bg-white rounded-md overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-700">Item List</h4>
          <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>

        <div className="min-h-[250px]">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead className="font-semibold text-gray-600">Item Name</TableHead>
                <TableHead className="font-semibold text-gray-600">No of Labels</TableHead>
                <TableHead className="font-semibold text-gray-600">Header</TableHead>
                <TableHead className="font-semibold text-gray-600">Line 1</TableHead>
                <TableHead className="font-semibold text-gray-600">Line 2</TableHead>
                <TableHead className="font-semibold text-gray-600">Line 3</TableHead>
                <TableHead className="font-semibold text-gray-600">Line 4</TableHead>
                <TableHead className="font-semibold text-gray-600 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-[200px] text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ScanBarcode className="w-16 h-16 mb-2 opacity-50" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.noOfLabels}</TableCell>
                    <TableCell>{item.header}</TableCell>
                    <TableCell>{item.line1}</TableCell>
                    <TableCell>{item.line2}</TableCell>
                    <TableCell>{item.line3}</TableCell>
                    <TableCell>{item.line4}</TableCell>
                    <TableCell>
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-4 bg-white">
          <Button 
            variant="outline" 
            disabled={items.length === 0} 
            className="px-8 rounded-full border-gray-300 text-gray-600 font-semibold"
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button 
            disabled={items.length === 0} 
            className="px-8 rounded-full bg-[#B1B8D1] hover:bg-indigo-400 text-white font-semibold disabled:opacity-50"
            onClick={() => setIsGenerateOpen(true)}
          >
            Generate
          </Button>
        </div>
      </div>

      <BarcodePreviewModal 
        open={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen} 
        items={items} 
        allItems={allItems}
        companyName={companyName}
      />
      <BarcodeGenerateModal 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen} 
        items={items} 
        allItems={allItems}
        companyName={companyName}
      />
    </>
  );
}
