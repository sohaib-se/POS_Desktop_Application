import { useState } from "react";
import { InfoCheckRow, SectionTitle, InfoIcon } from "./SharedComponents";
import { BLUE, BORDER, TEXT_DARK, TEXT_LABEL, TEXT_MUTED } from "./constants";

export function RegularItemTableBlock() {
  const [minRows, setMinRows] = useState(0);

  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>Item Table</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      <InfoCheckRow label="Expand table to print on whole page" defaultChecked />
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: TEXT_LABEL, marginRight: 8 }}>
          Min No. of Rows in Item Table
        </span>
        <InfoIcon />
        <input
          type="number"
          value={minRows}
          onChange={(e) => setMinRows(Number(e.target.value))}
          style={{
            marginLeft: 8,
            width: 60,
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
          Item Table Customization &gt;
        </span>
      </div>
    </div>
  );
}
