import type { Dispatch, SetStateAction } from "react";
import { Upload } from "lucide-react";

interface MoreDetailsProps {
  businessType: string;
  setBusinessType: Dispatch<SetStateAction<string>>;
  businessCategory: string;
  setBusinessCategory: Dispatch<SetStateAction<string>>;
  pincode: string;
  setPincode: Dispatch<SetStateAction<string>>;
  businessAddress: string;
  setBusinessAddress: Dispatch<SetStateAction<string>>;
  signature: string | null;
  setSignature: Dispatch<SetStateAction<string | null>>;
}

export function MoreDetails({
  businessType,
  setBusinessType,
  businessCategory,
  setBusinessCategory,
  pincode,
  setPincode,
  businessAddress,
  setBusinessAddress,
  signature,
  setSignature,
}: MoreDetailsProps) {
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="col-span-2">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        More Details
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            >
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Service">Service</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Category
            </label>
            <select
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            >
              <option value="Book / Stationary store">Book / Stationary store</option>
              <option value="Grocery">Grocery</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode
            </label>
            <input
              type="text"
              placeholder="Enter Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            />
          </div>
        </div>
        <div className="row-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <textarea
            placeholder="Enter Business Address"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            rows={7}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent resize-none"
          />
        </div>
        <div className="row-span-3 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Signature
          </label>
          <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden group relative block">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleSignatureChange} 
            />
            {signature ? (
              <img src={signature} alt="Signature" className="max-w-full max-h-full object-contain" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload Signature</p>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
