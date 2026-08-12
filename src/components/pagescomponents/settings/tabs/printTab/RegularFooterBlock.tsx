import { useState } from "react";
import { InfoCheckRow, SectionTitle, InfoIcon } from "./SharedComponents";
import { BLUE, BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function RegularFooterBlock() {
  const [checked, setChecked] = useState(true);
  const [signatureText, setSignatureText] = useState("Authorized Signatory");

  return (
    <div style={{ marginTop: 24, marginBottom: 40 }}>
      <SectionTitle>Footer</SectionTitle>
      <div style={{ borderTop: `1px solid ${BORDER}`, margin: "8px 0 16px" }} />
      
      <InfoCheckRow label="Print Description" defaultChecked />
      <InfoCheckRow label="Print Terms and Conditions" defaultChecked />
      <InfoCheckRow label="Print Received by details" defaultChecked />
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          style={{
            accentColor: BLUE,
            width: 15,
            height: 15,
            cursor: "pointer",
            flexShrink: 0,
            marginRight: 8 }}
        />
        <div style={{ position: "relative", width: 220 }}>
          <span
            style={{
              position: "absolute",
              top: -7,
              left: 10,
              background: "#f8fafc",
              padding: "0 4px",
              fontSize: 10,
              color: TEXT_MUTED }}
          >
            Print Signature Text
          </span>
          <input
            type="text"
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
            disabled={!checked}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "10px 10px 6px",
              fontSize: 13,
              color: TEXT_DARK,
              outline: "none",
              background: checked ? "#fff" : "#f3f4f6" }}
          />
        </div>
        <InfoIcon />
        <span style={{ fontSize: 12, color: BLUE, cursor: "pointer", marginLeft: 8 }}>
          Change Signature
        </span>
      </div>

      <InfoCheckRow label="Payment Mode" />
    </div>
  );
}
