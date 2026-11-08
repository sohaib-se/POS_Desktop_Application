import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        {t("profile.businessDetails")}
      </h2>
      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.businessName")}*
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
            {t("profile.phoneNumber")}
          </label>
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder={t("profile.enterPhone", "Enter phone number")}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.emailId")}
          </label>
          <input
            type="email"
            placeholder={t("profile.enterEmail")}
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
          />
        </div>

        {/* Terms & Conditions */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("profile.termsAndConditions")}
          </label>
          <textarea
            placeholder={t("profile.enterTerms")}
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
