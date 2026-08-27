import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Upload, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../../common/ConfirmDeleteModal";

const BUSINESS_CATEGORIES = [
  "Book / Stationary store",
  "Grocery",
  "Electronics",
  "Clothing & Apparel",
  "Pharmacy / Medical",
  "Bakery & Confectionery",
  "Restaurant / Café",
  "Hardware & Tools",
  "Furniture & Home Decor",
  "Jewelry & Accessories",
  "Footwear",
  "Auto Parts & Accessories",
  "Sports & Fitness",
  "Cosmetics & Beauty",
  "Mobile & Telecom",
  "Toys & Games",
  "Agricultural Supplies",
  "Textile & Fabric",
  "Electrical & Lighting",
  "Pet Supplies",
  "Optician / Eye Care",
  "Supermarket",
  "Wholesale Distributor",
  "Custom",
];

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
  onProfileSaved?: () => void;
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
  onProfileSaved,
}: MoreDetailsProps) {
  const isCustomCategory = !BUSINESS_CATEGORIES.slice(0, -1).includes(businessCategory) ||
    businessCategory === "Custom";
  const [customCategoryValue, setCustomCategoryValue] = useState(
    isCustomCategory && businessCategory !== "Custom" ? businessCategory : ""
  );

  // Sync when parent loads the profile asynchronously
  useEffect(() => {
    const isCustom = !BUSINESS_CATEGORIES.slice(0, -1).includes(businessCategory) ||
      businessCategory === "Custom";
    if (isCustom && businessCategory && businessCategory !== "Custom") {
      setCustomCategoryValue(businessCategory);
    }
  }, [businessCategory]);

  const [isConfirmSigOpen, setIsConfirmSigOpen] = useState(false);

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

  const handleDeleteSignature = () => {
    setSignature(null);
    setIsConfirmSigOpen(false);
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Category
            </label>
            <select
              value={isCustomCategory ? "Custom" : businessCategory}
              onChange={(e) => {
                if (e.target.value === "Custom") {
                  setBusinessCategory("Custom");
                  setCustomCategoryValue("");
                } else {
                  setBusinessCategory(e.target.value);
                  setCustomCategoryValue("");
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {isCustomCategory && (
              <input
                type="text"
                placeholder="Enter custom category"
                value={customCategoryValue}
                onChange={(e) => {
                  setCustomCategoryValue(e.target.value);
                  setBusinessCategory(e.target.value || "Custom");
                }}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
              />
            )}
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
          <div className="relative group/sig flex-1 flex flex-col h-full min-h-[120px]">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="signature-upload"
              onChange={handleSignatureChange}
            />
            {signature ? (
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden group/sigimg">
                <img src={signature} alt="Signature" className="max-w-full max-h-full object-contain" />

                {/* Overlay with Upload and Delete icons */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-6 opacity-0 group-hover/sigimg:opacity-100 transition-opacity">
                  <label
                    htmlFor="signature-upload"
                    className="cursor-pointer text-white hover:text-blue-300 transition-colors"
                    title="Change signature"
                  >
                    <Upload className="w-8 h-8" />
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsConfirmSigOpen(true);
                    }}
                    title="Delete signature"
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-8 h-8" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="signature-upload"
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors block"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Upload Signature</p>
              </label>
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isConfirmSigOpen}
        onClose={() => setIsConfirmSigOpen(false)}
        onConfirm={handleDeleteSignature}
        title="Remove Signature"
        message="Are you sure you want to remove the business signature? Remember to save changes."
        isDeleting={false}
      />
    </div>
  );
}
