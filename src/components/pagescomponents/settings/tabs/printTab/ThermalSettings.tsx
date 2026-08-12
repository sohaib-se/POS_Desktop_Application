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
} from "./SharedComponents";

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
              lineHeight: 1.3,
            }}
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
            lineHeight: 1.3,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600 }}>Custom</div>
          <div style={{ fontSize: 10, opacity: 0.85 }}>48 (Chars)</div>
        </button>
      </div>
    </div>
  );
}

export function ThermalSettings() {
  return (
    <>
      <InfoCheckRow label="Make Thermal Printer Default" />
      <PageSizeSelector />
      <Divider />
      <LabeledSelect label="Printing Type" options={["Text Printing", "Image Printing"]} defaultValue="Text Printing" />
      <InfoCheckRow label="Use Text Styling(Bold)" defaultChecked />
      <InfoCheckRow label="Auto Cut Paper After Printing" />
      <InfoCheckRow label="Open Cash Drawer After Printing" />
      <div style={{ display: "flex", gap: 16 }}>
        <LabeledNumber label="Extra lines at the end" defaultValue={0} />
        <LabeledNumber label="Number of copies" defaultValue={1} />
      </div>
      
      <Divider />
      <SectionTitle>Print Company Info / Header</SectionTitle>
      <InfoFieldRow label="Company Name" defaultValue="My Company" defaultChecked />
      <InfoLogoRow defaultChecked />
      <InfoFieldRow label="Address" placeholder="Address" defaultChecked />
      <InfoFieldRow label="Email" placeholder="Email" defaultChecked />
      <InfoFieldRow label="Phone Number" defaultValue="3369007084" defaultChecked />
      <div style={{ color: BLUE, fontSize: 12, fontWeight: 600, marginTop: 12, cursor: "pointer" }}>Change Transaction Names &gt;</div>

      <Divider />
      <SectionTitle>Item table</SectionTitle>
      <InfoCheckRow label="S.No" defaultChecked />
      <InfoCheckRow label="Units of Measurement" defaultChecked />
      <InfoCheckRow label="MRP" defaultChecked />
      <InfoCheckRow label="Description" defaultChecked />

      <Divider />
      <SectionTitle>Additional Item Details</SectionTitle>
      <InfoCheckRow label="Batch No." defaultChecked />
      <InfoCheckRow label="Exp. Date" defaultChecked />
      <InfoCheckRow label="Mfg. Date" defaultChecked />
      <InfoCheckRow label="Size" defaultChecked />
      <InfoCheckRow label="Model No." defaultChecked />
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
      <InfoCheckRow label="Print Amount with Grouping" defaultChecked />
      
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
            cursor: "default",
          }}
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
