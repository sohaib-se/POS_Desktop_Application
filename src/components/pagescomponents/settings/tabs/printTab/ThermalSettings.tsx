import { useState } from "react";
import { BLUE, BORDER, TEXT_LABEL, TEXT_MUTED } from "./constants";
import {
  Divider,
  InfoCheckRow,
  InfoFieldRow,
  InfoLogoRow,
  LabeledNumber,
  LabeledSelect,
  SectionTitle } from "./SharedComponents";

function PageSizeSelector() {
  const options: { label: string; sub: string }[] = [
    { label: "2 Inch", sub: "58mm" },
    { label: "3 Inch", sub: "68mm" },
    { label: "4 Inch", sub: "80mm" },
  ];
  const [active, setActive] = useState(1);
  const isCustom = active === 3;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 8 }}>Page Size</div>
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
        <button
          onClick={() => setActive(3)}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            border: `1.5px solid ${isCustom ? BLUE : BORDER}`,
            background: isCustom ? BLUE : "#fff",
            color: isCustom ? "#fff" : TEXT_LABEL,
            cursor: "pointer",
            textAlign: "center",
            lineHeight: 1.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600 }}>Custom</div>
          <div style={{ fontSize: 10, opacity: 0.85 }}>48 (Chars)</div>
        </button>
      </div>
    </div>
  );
}

import { useCompanyDetails } from "./useCompanyDetails";

export function ThermalSettings() {
  const { companyName, phone, address, email, showCompanyName, showPhone, showAddress, showEmail, showLogo, updateDetail } = useCompanyDetails();

  return (
    <>
      <InfoCheckRow label="Make Thermal Printer Default" />
      <PageSizeSelector />
      <Divider />
      <InfoCheckRow label="Use Text Styling(Bold)" defaultChecked />
      <InfoCheckRow label="Auto Cut Paper After Printing" />
      <LabeledNumber label="Number of copies" defaultValue={1} />
      
      <Divider />
      <SectionTitle>Print Company Info / Header</SectionTitle>
      <InfoFieldRow label="Company Name" value={companyName} onChange={(val) => updateDetail("companyName", val)} checked={showCompanyName} onCheckedChange={(c) => updateDetail("show_companyName", c.toString())} />
      <InfoLogoRow checked={showLogo} onCheckedChange={(c) => updateDetail("show_logo", c.toString())} />
      <InfoFieldRow label="Address" value={address} onChange={(val) => updateDetail("address", val)} placeholder="Address" checked={showAddress} onCheckedChange={(c) => updateDetail("show_address", c.toString())} />
      <InfoFieldRow label="Email" value={email} onChange={(val) => updateDetail("email", val)} placeholder="Email" checked={showEmail} onCheckedChange={(c) => updateDetail("show_email", c.toString())} />
      <InfoFieldRow label="Phone Number" value={phone} onChange={(val) => updateDetail("phone", val)} checked={showPhone} onCheckedChange={(c) => updateDetail("show_phone", c.toString())} />
      <div style={{ color: BLUE, fontSize: 12, fontWeight: 600, marginTop: 12, cursor: "pointer" }}>Change Transaction Names &gt;</div>

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
