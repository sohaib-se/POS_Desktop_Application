import {
  InfoCheckRow,
  InfoFieldRow,
  InfoLogoRow,
  LabeledSelect,
  SectionTitle,
  InfoIcon } from "./SharedComponents";
import { BORDER } from "./constants";

import { useCompanyDetails } from "./useCompanyDetails";

export function RegularCompanyInfoBlock() {
  const { companyName, phone, address, email, showCompanyName, showPhone, showAddress, showEmail, showLogo, updateDetail } = useCompanyDetails();

  return (
    <>
      <SectionTitle>Print Company Info / Header</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      
      <InfoCheckRow label="Make Regular Printer Default" defaultChecked />
      <InfoCheckRow label="Print repeat header in all pages" defaultChecked />
      <InfoFieldRow label="Company Name" value={companyName} onChange={(val) => updateDetail("companyName", val)} checked={showCompanyName} onCheckedChange={(c) => updateDetail("show_companyName", c.toString())} />
      <InfoLogoRow checked={showLogo} onCheckedChange={(c) => updateDetail("show_logo", c.toString())} />
      <InfoFieldRow label="Address" value={address} onChange={(val) => updateDetail("address", val)} checked={showAddress} onCheckedChange={(c) => updateDetail("show_address", c.toString())} placeholder="Address" />
      <InfoFieldRow label="Email" value={email} onChange={(val) => updateDetail("email", val)} checked={showEmail} onCheckedChange={(c) => updateDetail("show_email", c.toString())} placeholder="Email" />
      <InfoFieldRow label="Phone Number" value={phone} onChange={(val) => updateDetail("phone", val)} checked={showPhone} onCheckedChange={(c) => updateDetail("show_phone", c.toString())} />

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledSelect label="Paper Size" options={["A4", "A5", "Letter"]} defaultValue="A4" />
        <InfoIcon />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledSelect
          label="Company Name Text Size"
          options={["Small", "Medium", "Large"]}
          defaultValue="Large"
        />
        <InfoIcon />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledSelect
          label="Invoice Text Size"
          options={["Small", "Medium", "Large"]}
          defaultValue="Medium"
        />
        <InfoIcon />
      </div>
    </>
  );
}
