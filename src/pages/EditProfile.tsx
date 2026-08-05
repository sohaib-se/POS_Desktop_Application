import { useState } from "react";
import { EditProfileHeader } from "../components/pagescomponents/editprofile/EditProfileHeader";
import { LogoSection } from "../components/pagescomponents/editprofile/LogoSection";
import { BusinessDetails } from "../components/pagescomponents/editprofile/BusinessDetails";
import { MoreDetails } from "../components/pagescomponents/editprofile/MoreDetails";
import { EditProfileFooter } from "../components/pagescomponents/editprofile/EditProfileFooter";

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
      <EditProfileHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <LogoSection />
          
          <div className="grid grid-cols-3 gap-8">
            <BusinessDetails
              businessName={businessName}
              setBusinessName={setBusinessName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              emailId={emailId}
              setEmailId={setEmailId}
            />
            <MoreDetails
              businessType={businessType}
              setBusinessType={setBusinessType}
              businessCategory={businessCategory}
              setBusinessCategory={setBusinessCategory}
              pincode={pincode}
              setPincode={setPincode}
              businessAddress={businessAddress}
              setBusinessAddress={setBusinessAddress}
            />
          </div>
        </div>
      </div>

      <EditProfileFooter onBack={onBack} onSave={handleSave} />
    </div>
  );
}
