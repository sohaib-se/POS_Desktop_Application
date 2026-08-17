import { Filter, Search } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { RecycleBinItem } from "@/pages/recyclebin";

interface RecycleBinTableProps {
  items: RecycleBinItem[];
  isLoading: boolean;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function RecycleBinTable({ items, isLoading, selectedIds, setSelectedIds }: RecycleBinTableProps) {
  const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs' });
  const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
  const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9 h-9" placeholder="Search..." />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
            <TableRow className="border-gray-200">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  className="border-gray-300 rounded-sm w-4 h-4"
                />
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  TRANSACTION DATE <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  REF. NO. <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  PARTY NAME <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  TXN TYPE <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  PAYMENT TYPE <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  AMOUNT <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500">
                <div className="flex items-center justify-between">
                  DELETED ON <Filter className="w-3 h-3 ml-2" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  No deleted items found.
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id} className="border-gray-100 hover:bg-gray-50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectRow(item.id, checked as boolean)}
                      className="border-gray-300 rounded-sm w-4 h-4"
                    />
                  </TableCell>
                  <TableCell className="text-sm">{item.transaction_date || '-'}</TableCell>
                  <TableCell className="text-sm">{item.ref_no || '-'}</TableCell>
                  <TableCell className="text-sm">{item.party_name || '-'}</TableCell>
                  <TableCell className="text-sm">{item.txn_type}</TableCell>
                  <TableCell className="text-sm">{item.payment_type || '-'}</TableCell>
                  <TableCell className="text-sm">{item.amount > 0 ? `${currencyStr} ${item.amount}` : '-'}</TableCell>
                  <TableCell className="text-sm">{item.deleted_on}</TableCell>
                </TableRow>
              ))
            )}
            <TableRow className="border-0">
              <TableCell colSpan={8} className="h-full"></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
