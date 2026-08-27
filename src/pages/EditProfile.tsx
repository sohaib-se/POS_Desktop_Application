import { useState, useEffect } from "react";
import { EditProfileHeader } from "../components/pagescomponents/editprofile/EditProfileHeader";
import { LogoSection } from "../components/pagescomponents/editprofile/LogoSection";
import { BusinessDetails } from "../components/pagescomponents/editprofile/BusinessDetails";
import { MoreDetails } from "../components/pagescomponents/editprofile/MoreDetails";
import { EditProfileFooter } from "../components/pagescomponents/editprofile/EditProfileFooter";

interface EditProfileProps {
  onBack?: () => void;
  onProfileSaved?: () => void;
  setUnsavedChanges?: (val: boolean) => void;
}

export function EditProfile({ onBack, onProfileSaved, setUnsavedChanges }: EditProfileProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Retail");
  const [businessCategory, setBusinessCategory] = useState("Book / Stationary store");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [termsConditions, setTermsConditions] = useState("");

  const [initialProfileStr, setInitialProfileStr] = useState<string>("");

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/user_profile')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBusinessName(data.business_name || "");
          setBusinessType(data.business_type || "Retail");
          setBusinessCategory(data.category || "Book / Stationary store");
          setPhoneNumber(data.phone || "");
          setEmailId(data.email || "");
          setBusinessAddress(data.address || "");
          setPincode(data.pincode || "");
          setLogo(data.logo || null);
          setSignature(data.signature || null);
          setTermsConditions(data.terms_conditions || "");
          
          setInitialProfileStr(JSON.stringify({
             businessName: data.business_name || "",
             businessType: data.business_type || "Retail",
             businessCategory: data.category || "Book / Stationary store",
             phoneNumber: data.phone || "",
             emailId: data.email || "",
             businessAddress: data.address || "",
             pincode: data.pincode || "",
             logo: data.logo || null,
             signature: data.signature || null,
             termsConditions: data.terms_conditions || ""
          }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!initialProfileStr) return;
    const currentStr = JSON.stringify({
       businessName,
       businessType,
       businessCategory,
       phoneNumber,
       emailId,
       businessAddress,
       pincode,
       logo,
       signature,
       termsConditions
    });
    const dirty = currentStr !== initialProfileStr;
    setUnsavedChanges?.(dirty);
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [businessName, businessType, businessCategory, phoneNumber, emailId, businessAddress, pincode, logo, signature, termsConditions, initialProfileStr, setUnsavedChanges]);

  const handleSave = async () => {
    try {
      if (logo === null) {
        await fetch('/api/delete_profile_image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'logo' }),
        });
      }
      
      if (signature === null) {
        await fetch('/api/delete_profile_image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'signature' }),
        });
      }

      const res = await fetch('/api/user_profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType,
          category: businessCategory,
          phone: phoneNumber,
          email: emailId,
          address: businessAddress,
          pincode,
          logo,
          signature,
          termsConditions
        })
      });
      if (res.ok) {
        setInitialProfileStr(JSON.stringify({
          businessName,
          businessType,
          businessCategory,
          phoneNumber: phoneNumber,
          emailId: emailId,
          businessAddress,
          pincode,
          logo,
          signature,
          termsConditions
        }));
        setUnsavedChanges?.(false);
        showToast("Profile saved successfully", "success");
        onProfileSaved?.();
      } else {
        showToast("Failed to save profile", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error saving profile", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {toast && (
        <div className={`absolute top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
      <EditProfileHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <LogoSection logo={logo} setLogo={setLogo} />
          
          <div className="grid grid-cols-3 gap-8">
            <BusinessDetails
              businessName={businessName}
              setBusinessName={setBusinessName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              emailId={emailId}
              setEmailId={setEmailId}
              termsConditions={termsConditions}
              setTermsConditions={setTermsConditions}
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
              signature={signature}
              setSignature={setSignature}
            />
          </div>
        </div>
      </div>

      <EditProfileFooter onBack={onBack} onSave={handleSave} />
    </div>
  );
}
