import { useState } from "react";
import { BLUE, BORDER, TEXT_LABEL, TEXT_MUTED } from "./constants";
import {
  Divider,
  InfoCheckRow,
  InfoFieldRow,
  InfoLogoRow,
  LabeledNumber,
  LabeledSelect,
  SectionTitle,
  TooltipContent,
  InfoIcon } from "./SharedComponents";

function PageSizeSelector({ active, setActive }: { active: number, setActive: (idx: number) => void }) {
  const options: { label: string; sub: string }[] = [
    { label: "2 Inch", sub: "58mm" },
    { label: "3 Inch", sub: "68mm" },
    { label: "4 Inch", sub: "80mm" },
  ];
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: TEXT_MUTED }}>Page Size</div>
        <InfoIcon tooltip={<TooltipContent title="Page Size" questions={[{q: "What is this?", a: "Select the size of paper for invoice print"}]} />} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((o, i) => (
          <button
            key={o.label}
            onClick={() => setActive(i)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `1.5px solid ${active === i ? BLUE : BORDER}`,
              background: active === i ? BLUE : "#fff",
              color: active === i ? "#fff" : TEXT_LABEL,
              cursor: "pointer",
              textAlign: "center",
              lineHeight: 1.3 }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{o.label}</div>
            <div style={{ fontSize: 10, opacity: 0.85 }}>{o.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useCompanyDetails } from "./useCompanyDetails";

export function ThermalSettings() {
  const { companyName, phone, address, email, showCompanyName, showPhone, showAddress, showEmail, showLogo, updateDetail, thermalPrinterDefault, thermalPageSize, thermalTextBold, thermalAutoCut, thermalCopies } = useCompanyDetails();

  return (
    <>
      <InfoCheckRow 
        label="Make Thermal Printer Default" 
        checked={thermalPrinterDefault} 
        onCheckedChange={(c) => updateDetail("thermalPrinterDefault", c.toString())} 
        tooltip={<TooltipContent title="Make Thermal Printer Default" questions={[{q: "What is this?", a: "You can either make Regular or Thermal printer as your default printer. Choose the one which you will use."}]} />}
      />
      <PageSizeSelector active={parseInt(thermalPageSize, 10)} setActive={(idx) => updateDetail("thermalPageSize", idx.toString())} />
      <Divider />
      <InfoCheckRow 
        label="Use Text Styling(Bold)" 
        checked={thermalTextBold} 
        onCheckedChange={(c) => updateDetail("thermalTextBold", c.toString())} 
        tooltip={<TooltipContent title="Use Text Styling(Bold)" questions={[{q: "What is this?", a: "Enables you to print text stying like bold, large text etc in thermal printer."}]} />}
      />
      <InfoCheckRow 
        label="Auto Cut Paper After Printing" 
        checked={thermalAutoCut} 
        onCheckedChange={(c) => updateDetail("thermalAutoCut", c.toString())} 
        tooltip={<TooltipContent title="Auto Cut Paper After Printing" questions={[{q: "What is this?", a: "If you want the machine to auto cut your invoice after the printing is done. You can enable this setting."}]} />}
      />
      <LabeledSelect 
        label="Number of copies" 
        value={thermalCopies.toString()} 
        onChange={(val) => updateDetail("thermalCopies", val)} 
        options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]} 
        defaultValue="1" 
        tooltip={<TooltipContent title="Number of copies" questions={[{q: "What is this?", a: "Enables you to print 1 to 9 copies of the bill."}]} />}
      />
      
      <Divider />
      <SectionTitle>Print Company Info / Header</SectionTitle>
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
        placeholder="Address" 
        checked={showAddress} 
        onCheckedChange={(c) => updateDetail("show_address", c.toString())} 
        tooltip={<TooltipContent title="Address" questions={[{q: "What is this?", a: "Enables you to print your company address on invoices/bills and party statement."}]} />}
      />
      <InfoFieldRow 
        label="Email" 
        value={email} 
        onChange={(val) => updateDetail("email", val)} 
        placeholder="Email" 
        checked={showEmail} 
        onCheckedChange={(c) => updateDetail("show_email", c.toString())} 
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


      <Divider />
      <SectionTitle>Item table</SectionTitle>
      <InfoCheckRow label="S.No" defaultChecked />
      <InfoCheckRow label="Units of Measurement" defaultChecked />
      <InfoCheckRow label="MRP" defaultChecked />
      <InfoCheckRow label="Description" defaultChecked />

      <Divider />
      <SectionTitle>Additional Item Details</SectionTitle>
      <InfoCheckRow label="Exp. Date" defaultChecked />
      <InfoCheckRow label="Mfg. Date" defaultChecked />
      <InfoCheckRow label="Serial No." defaultChecked />

      <Divider />
      <SectionTitle>Totals &amp; Taxes</SectionTitle>
      <InfoCheckRow label="Total Item Quantity" defaultChecked />
      <InfoCheckRow 
        label="Amount with Decimal" 
        trailing={<span style={{fontSize: 11, color: TEXT_MUTED, marginLeft: 4}}>e.g. 0.00</span>} 
        defaultChecked 
      />
      <InfoCheckRow label="Received Amount" defaultChecked />
      <InfoCheckRow label="Balance Amount" defaultChecked />
      <InfoCheckRow label="Current Balance of Party" />
      <InfoCheckRow label="Tax Details" defaultChecked />
      <InfoCheckRow label="You Saved" defaultChecked />
      
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, marginBottom: 12 }}>
        <LabeledSelect label="Amount in Words" options={["Indian", "International"]} defaultValue="Indian" />
        <span
          title="More info"
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: `1px solid ${TEXT_MUTED}`,
            color: TEXT_MUTED,
            fontSize: 9,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: "default" }}
        >
          i
        </span>
      </div>

      <Divider />
      <SectionTitle>Footer</SectionTitle>
      <InfoCheckRow label="Print Description" defaultChecked />
      <InfoCheckRow label="Print Terms and Conditions" defaultChecked />
    </>
  );
}
