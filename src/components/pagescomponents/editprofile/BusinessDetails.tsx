import type { Dispatch, SetStateAction } from "react";
import { PhoneInput } from "@/components/ui/phone-input";

// ── Main BusinessDetails component ────────────────────────────────────────────

interface BusinessDetailsProps {
  businessName: string;
  setBusinessName: Dispatch<SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  emailId: string;
  setEmailId: Dispatch<SetStateAction<string>>;
  termsConditions: string;
  setTermsConditions: Dispatch<SetStateAction<string>>;
}

export function BusinessDetails({
  businessName,
  setBusinessName,
  phoneNumber,
  setPhoneNumber,
  emailId,
  setEmailId,
  termsConditions,
  setTermsConditions,
}: BusinessDetailsProps) {
  return (
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
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
          />
        </div>

        {/* Email */}
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

        {/* Terms & Conditions */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms &amp; Conditions
          </label>
          <textarea
            placeholder="Enter Terms &amp; Conditions"
            value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}
