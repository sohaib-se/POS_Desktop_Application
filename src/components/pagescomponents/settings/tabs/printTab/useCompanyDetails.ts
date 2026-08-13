import { useState, useEffect } from "react";
import { userProfile } from "@/data/mockData";

export function useCompanyDetails() {
  const [profileData, setProfileData] = useState({
    companyName: userProfile.businessName,
    phone: userProfile.phone,
    address: userProfile.address,
    email: userProfile.email,
    logo: userProfile.logo || null
  });

  useEffect(() => {
    fetch('/api/user_profile')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setProfileData({
            companyName: data.business_name || userProfile.businessName,
            phone: data.phone || userProfile.phone,
            address: data.address || userProfile.address,
            email: data.email || userProfile.email,
            logo: data.logo || userProfile.logo || null
          });
        }
      })
      .catch(console.error);
  }, []);

  const getDetails = () => {
    const thermalPageSize = localStorage.getItem("print_thermalPageSize") || "3";
    // Adjust font size based on page size.
    // To simulate smaller paper (58mm) in a fixed 320px box, the text must be relatively LARGER 
    // so fewer characters fit per line.
    const thermalFontSizeOffset = thermalPageSize === "0" ? 3 : thermalPageSize === "1" ? 1.5 : 0;
    
    return {
      companyName: profileData.companyName,
      phone: profileData.phone,
      address: profileData.address,
      email: profileData.email,
      logo: profileData.logo,
      showCompanyName: localStorage.getItem("print_show_companyName") !== "false",
      showPhone: localStorage.getItem("print_show_phone") !== "false",
      showAddress: localStorage.getItem("print_show_address") !== "false",
      showEmail: localStorage.getItem("print_show_email") !== "false",
      showLogo: localStorage.getItem("print_show_logo") !== "false",
      paperSize: localStorage.getItem("print_paperSize") || "A4",
      companyNameTextSize: localStorage.getItem("print_companyNameTextSize") || "Large",
      invoiceTextSize: localStorage.getItem("print_invoiceTextSize") || "Medium",
      thermalPrinterDefault: localStorage.getItem("print_thermalPrinterDefault") === "true",
      thermalPageSize,
      thermalFontSizeOffset,
      thermalTextBold: localStorage.getItem("print_thermalTextBold") !== "false",
      thermalAutoCut: localStorage.getItem("print_thermalAutoCut") === "true",
      thermalCopies: parseInt(localStorage.getItem("print_thermalCopies") || "1", 10),
    };
  };

  const [details, setDetails] = useState(getDetails());

  useEffect(() => {
    setDetails(getDetails());
  }, [profileData]);

  useEffect(() => {
    const handleUpdate = () => {
      setDetails(getDetails());
    };
    window.addEventListener("company-details-update", handleUpdate);
    return () => window.removeEventListener("company-details-update", handleUpdate);
  }, [profileData]);

  const updateDetail = (key: string, value: string) => {
    localStorage.setItem(`print_${key}`, value);
    window.dispatchEvent(new Event("company-details-update"));
  };

  return { ...details, updateDetail };
}
