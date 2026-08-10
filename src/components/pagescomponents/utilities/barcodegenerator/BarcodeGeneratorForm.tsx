import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Item } from "@/types";

export interface BarcodeFormData {
  itemName: string;
  itemCode: string;
  noOfLabels: string;
  header: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
}

interface BarcodeGeneratorFormProps {
  formData: BarcodeFormData;
  setFormData: React.Dispatch<React.SetStateAction<BarcodeFormData>>;
  onAdd: () => void;
  isLoading?: boolean;
  items: Item[];
}

const LABEL_OPTIONS = ["None", "Company Name", "Item Name", "Sale Price", "Discount"];

export function BarcodeGeneratorForm({ formData, setFormData, onAdd, isLoading, items }: BarcodeGeneratorFormProps) {
  const handleChange = (field: keyof BarcodeFormData, value: string) => {
    if (field === 'itemName') {
      const selectedItem = items.find(i => i.name === value);
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        itemCode: selectedItem?.code || prev.itemCode // Auto-fill item code
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value === "None" ? "" : value }));
    }
  };

  const getAvailableOptions = (currentField: keyof BarcodeFormData) => {
    const selectedValues = [
      formData.header,
      formData.line1,
      formData.line2,
      formData.line3,
      formData.line4,
    ].filter(Boolean); // removes empty strings

    return LABEL_OPTIONS.filter(opt => {
      if (opt === "None") return true;
      if (formData[currentField] === opt) return true; // Keep currently selected option
      return !selectedValues.includes(opt); // Exclude if selected elsewhere
    });
  };

  const renderDropdown = (field: keyof BarcodeFormData, placeholder: string, label: string) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <Select 
        value={formData[field] || "None"} 
        onValueChange={(val) => handleChange(field, val)}
      >
        <SelectTrigger className="w-full text-sm text-gray-700 border-gray-300">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {getAvailableOptions(field).map(opt => (
            <SelectItem key={opt} value={opt}>
              {opt === "None" ? `Enter ${label}` : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex-1 pr-8">
      <h4 className="font-semibold text-gray-700 mb-6">Enter item details to add for barcode</h4>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Item Name<span className="text-red-500">*</span>
          </label>
          <Select value={formData.itemName} onValueChange={(val) => handleChange('itemName', val)}>
            <SelectTrigger className="w-full text-sm text-gray-700 border-gray-300">
              <SelectValue placeholder="Enter Item Name" />
            </SelectTrigger>
            <SelectContent>
              {items.map(item => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Item Code<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Enter Item Code" 
              className="text-sm placeholder:text-gray-400 border-gray-300 pr-24"
              value={formData.itemCode}
              onChange={(e) => handleChange('itemCode', e.target.value)}
            />
            <button
              className="absolute right-1 top-1 bottom-1 px-3 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
                handleChange('itemCode', randomCode);
              }}
            >
              Assign Code
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            No of Labels<span className="text-red-500">*</span>
          </label>
          <Input 
            type="text" 
            placeholder="Enter No of Labels" 
            className="text-sm placeholder:text-gray-400 border-gray-300"
            value={formData.noOfLabels}
            onChange={(e) => handleChange('noOfLabels', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {renderDropdown('header', 'Enter Header', 'Header')}
        {renderDropdown('line1', 'Enter Line 1', 'Line 1')}
        {renderDropdown('line2', 'Enter Line 2', 'Line 2')}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {renderDropdown('line3', 'Enter Line 3', 'Line 3')}
        {renderDropdown('line4', 'Enter Line 4', 'Line 4')}
        <div className="flex items-end">
          <Button 
            className="w-full bg-[#B1B8D1] hover:bg-indigo-300 text-white font-semibold rounded-full disabled:opacity-50"
            onClick={onAdd}
            disabled={isLoading || !formData.itemName || !formData.itemCode || !formData.noOfLabels}
          >
            {isLoading ? "Adding..." : "Add for Barcode"}
          </Button>
        </div>
      </div>
    </div>
  );
}
