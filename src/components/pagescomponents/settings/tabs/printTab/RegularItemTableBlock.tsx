import { InfoCheckRow, SectionTitle } from "./SharedComponents";
import { BLUE, BORDER } from "./constants";

export function RegularItemTableBlock() {

  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>Item Table</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      <InfoCheckRow label="Expand table to print on whole page" defaultChecked />
      
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: BLUE, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
          Item Table Customization &gt;
        </span>
      </div>
    </div>
  );
}
