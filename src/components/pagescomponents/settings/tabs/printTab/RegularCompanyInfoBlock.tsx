import { useState } from "react";
import {
  InfoCheckRow,
  InfoFieldRow,
  InfoLogoRow,
  LabeledSelect,
  SectionTitle,
  InfoIcon,
} from "./SharedComponents";
import { BLUE, BORDER, TEXT_DARK, TEXT_LABEL } from "./constants";

export function RegularCompanyInfoBlock() {
  const [extraSpace, setExtraSpace] = useState(0);

  return (
    <>
      <SectionTitle>Print Company Info / Header</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      
      <InfoCheckRow label="Make Regular Printer Default" defaultChecked />
      <InfoCheckRow label="Print repeat header in all pages" defaultChecked />
      <InfoFieldRow label="Company Name" defaultValue="My Company" defaultChecked />
      <InfoLogoRow defaultChecked />
      <InfoFieldRow label="Address" placeholder="Address" defaultChecked />
      <InfoFieldRow label="Email" placeholder="Email" defaultChecked />
      <InfoFieldRow label="Phone Number" defaultValue="3369007084" defaultChecked />

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledSelect label="Paper Size" options={["A4", "A5", "Letter"]} defaultValue="A4" />
        <InfoIcon />
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LabeledSelect label="Orientation" options={["Portrait", "Landscape"]} defaultValue="Portrait" />
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

      <InfoCheckRow label="Print Original/Duplicate" />
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, marginTop: 8 }}>
        <span style={{ fontSize: 13, color: TEXT_LABEL, marginRight: 8 }}>
          Extra space on Top of PDF
        </span>
        <InfoIcon />
        <input
          type="number"
          value={extraSpace}
          onChange={(e) => setExtraSpace(Number(e.target.value))}
          style={{
            marginLeft: 8,
            width: 40,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 13,
            color: TEXT_DARK,
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <span style={{ color: BLUE, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
          Change Transaction Names &gt;
        </span>
      </div>
    </>
  );
}
