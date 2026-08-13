import {
  InfoCheckRow,
  InfoFieldRow,
  InfoLogoRow,
  LabeledSelect,
  SectionTitle,
  TooltipContent
} from "./SharedComponents";
import { BORDER } from "./constants";

import { useCompanyDetails } from "./useCompanyDetails";

export function RegularCompanyInfoBlock() {
  const { companyName, phone, address, email, showCompanyName, showPhone, showAddress, showEmail, showLogo, updateDetail, paperSize, companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  return (
    <>
      <SectionTitle>Print Company Info / Header</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      
      <InfoCheckRow 
        label="Make Regular Printer Default" 
        defaultChecked 
        tooltip={<TooltipContent title="Make Regular Printer Default" questions={[{q: "What is this?", a: "You can either make Regular or Thermal printer as your default printer. Choose the one which you will use."}]} />}
      />
      
      <InfoCheckRow 
        label="Print repeat header in all pages" 
        defaultChecked 
        tooltip={<TooltipContent title="Print repeat header in all pages" questions={[
          {q: "What is this?", a: "Enables you to print repeat header in all pages of invoices/bills"},
          {q: "Why to use?", a: "If you want a header on all pages of invoices/bills, you can enable this."}
        ]} />}
      />
      
      <InfoFieldRow 
        label="Company Name" 
        value={companyName} 
        onChange={(val) => updateDetail("companyName", val)} 
        checked={showCompanyName} 
        onCheckedChange={(c) => updateDetail("show_companyName", c.toString())}
        tooltip={<TooltipContent title="Company Name" questions={[{q: "What is this?", a: "Enables you to print company name on the transaction PDF and party statement."}]} />}
      />
      
      <InfoLogoRow 
        checked={showLogo} 
        onCheckedChange={(c) => updateDetail("show_logo", c.toString())} 
        tooltip={<TooltipContent title="Company Logo" questions={[{q: "What is this?", a: "Enables you to print company logo on the transaction PDF and party statement."}]} />}
      />
      
      <InfoFieldRow 
        label="Address" 
        value={address} 
        onChange={(val) => updateDetail("address", val)} 
        checked={showAddress} 
        onCheckedChange={(c) => updateDetail("show_address", c.toString())} 
        placeholder="Address" 
        tooltip={<TooltipContent title="Address" questions={[{q: "What is this?", a: "Enables you to print your company address on invoices/bills and party statement."}]} />}
      />
      
      <InfoFieldRow 
        label="Email" 
        value={email} 
        onChange={(val) => updateDetail("email", val)} 
        checked={showEmail} 
        onCheckedChange={(c) => updateDetail("show_email", c.toString())} 
        placeholder="Email" 
        tooltip={<TooltipContent title="Email" questions={[{q: "What is this?", a: "Print your company email on invoices/bills."}]} />}
      />
      
      <InfoFieldRow 
        label="Phone Number" 
        value={phone} 
        onChange={(val) => updateDetail("phone", val)} 
        checked={showPhone} 
        onCheckedChange={(c) => updateDetail("show_phone", c.toString())} 
        tooltip={<TooltipContent title="Phone Number" questions={[{q: "What is this?", a: "Enables you to print your company contact number on invoices/bills and party statement."}]} />}
      />

      <LabeledSelect
        label="Paper Size"
        options={["A4", "A5", "Letter"]}
        value={paperSize}
        onChange={(val) => updateDetail("paperSize", val)}
        tooltip={<TooltipContent title="Paper Size" questions={[{q: "What is this?", a: "Select the size of paper for invoice print"}]} />}
      />
      
      <LabeledSelect
        label="Company Name Text Size"
        options={["Small", "Medium", "Large"]}
        value={companyNameTextSize}
        onChange={(val) => updateDetail("companyNameTextSize", val)}
        tooltip={<TooltipContent title="Company Name Text Size" questions={[{q: "What is this?", a: "Select the size of text of company name in header for invoice print"}]} />}
      />
      
      <LabeledSelect
        label="Invoice Text Size"
        options={["Small", "Medium", "Large"]}
        value={invoiceTextSize}
        onChange={(val) => updateDetail("invoiceTextSize", val)}
        tooltip={<TooltipContent title="Invoice Text Size" questions={[{q: "What is this?", a: "Select the size of text for invoice print"}]} />}
      />
    </>
  );
}
