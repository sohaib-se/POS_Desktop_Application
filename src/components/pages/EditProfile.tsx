import { Upload } from "lucide-react";
import { useState } from "react";

interface EditProfileProps {
  onBack?: () => void;
}

export function EditProfile({ onBack }: EditProfileProps) {
  const [businessName, setBusinessName] = useState("Laimsoft");
  const [businessType, setBusinessType] = useState("Retail");
  const [businessCategory, setBusinessCategory] = useState(
    "Book / Stationary store",
  );
  const [phoneNumber, setPhoneNumber] = useState("3198224949");
  const [emailId, setEmailId] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const handleSave = () => {
    // Handle save logic here
    console.log({
      businessName,
      businessType,
      businessCategory,
      phoneNumber,
      emailId,
      businessAddress,
      pincode,
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Logo Section */}
          <div>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-400 flex flex-col items-center justify-center relative cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-300">Add</p>
                <p className="text-sm text-blue-300">Logo</p>
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Business Details */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Business Details
              </h2>
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name*
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email ID"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: More Details (spans 2 columns) */}
            <div className="col-span-2">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                More Details
              </h2>

              {/* Grid for More Details */}
              <div className="grid grid-cols-3 gap-4">
                {/* Left side fields */}
                <div className="space-y-4">
                  {/* Business Type */}
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

                  {/* Business Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Category
                    </label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
                    >
                      <option value="Book / Stationary store">
                        Book / Stationary store
                      </option>
                      <option value="Grocery">Grocery</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Pincode */}
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

                {/* Right side - Business Address */}
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

                {/* Right side - Add Signature (spans the remaining space) */}
                <div className="row-span-3 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Signature
                  </label>
                  <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Upload Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
