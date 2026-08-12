import { useState } from "react";
import { InfoCheckRow, SectionTitle, InfoIcon } from "./SharedComponents";
import { BORDER, TEXT_DARK, TEXT_LABEL } from "./constants";

export function RegularTotalsAndTaxesBlock() {
  const [amountInWords, setAmountInWords] = useState("Indian");

  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>Totals & Taxes</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      
      <InfoCheckRow label="Total Item Quantity" defaultChecked />
      <InfoCheckRow label="Amount with Decimal e.g. 0.00" defaultChecked />
      <InfoCheckRow label="Received Amount" defaultChecked />
      <InfoCheckRow label="Balance Amount" defaultChecked />
      <InfoCheckRow label="Current Balance of Party" />
      <InfoCheckRow label="Tax Details" defaultChecked />
      <InfoCheckRow label="You Saved" defaultChecked />
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: TEXT_LABEL, marginRight: 8 }}>
          Amount in Words
        </span>
        <InfoIcon />
        <select
          value={amountInWords}
          onChange={(e) => setAmountInWords(e.target.value)}
          style={{
            marginLeft: 8,
            width: 100,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 13,
            color: TEXT_DARK,
            outline: "none",
            background: "#fff" }}
        >
          <option value="Indian">Indian</option>
          <option value="International">International</option>
        </select>
      </div>
    </div>
  );
}
