import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, TEXT_MUTED } from "./constants";

export function ThermalTheme4Preview() {
  const { companyName, phone, email, address, logo, showCompanyName, showPhone, showEmail, showAddress, showLogo, updateDetail } = useCompanyDetails();
  const dash: React.CSSProperties = { borderTop: `1px dashed ${TEXT_MUTED}`, margin: "8px 0" };
  const rightCol = { width: 50, textAlign: "right" as const };

  return (
    <div style={{ background: "#fff", border: "1px solid #000", minHeight: "480px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", padding: "16px", fontFamily: "Inter, system-ui, sans-serif", fontSize: 9.5, color: TEXT_DARK, maxWidth: 320, margin: "0 auto", lineHeight: 1.4 }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 11 }}>{showCompanyName ? companyName : ""}</div>
      {showPhone && (<div style={{ textAlign: "center" }}>Ph.No.: {showPhone ? phone : ""}</div>)}
      <div style={dash} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><EditableText textKey="lbl_inv_no" defaultText="Invoice No.:" /> Inv12345</span>
        <span><EditableText textKey="lbl_date" defaultText="Date:" /> 12/08/2026</span>
      </div>
      <div style={dash} />
      <div style={{ textAlign: "center", fontWeight: 600 }}>Invoice</div>
      <div style={{ textAlign: "center" }}><strong>Vyapar tech solutions (Sample Party Name)</strong></div>
      <div style={{ textAlign: "center" }}>Ph. No.: (+971) 4 549 0404</div>
      <div style={{ marginTop: 4 }}><strong><EditableText textKey="lbl_bill_to" defaultText="Bill To:" /></strong></div>
      <div>Sarjapur Road, Bangalore</div>
      
      <div style={dash} />
      <div style={{ display: "flex", fontWeight: 600 }}>
        <span style={{ width: 15 }}>#</span>
        <span style={{ flex: 1 }}>Item Name</span>
      </div>
      <div style={{ display: "flex", fontWeight: 600, paddingLeft: 15 }}>
        <span style={{ flex: 1 }}>Qty</span>
        <span style={{ width: 40, textAlign: "right" }}>MRP</span>
        <span style={rightCol}>Price</span>
        <span style={rightCol}>Amount</span>
      </div>
      <div style={{ fontWeight: 600, paddingLeft: 15 }}><EditableText textKey="lbl_desc_no_colon" defaultText="Description" /></div>
      <div style={dash} />
      
      <div style={{ display: "flex" }}>
        <span style={{ width: 15 }}>1</span>
        <span style={{ flex: 1 }}>Brittania Chococlate Cake</span>
      </div>
      <div style={{ display: "flex", paddingLeft: 15 }}>
        <span style={{ flex: 1 }}>100 + 0Box</span>
        <span style={{ width: 40, textAlign: "right" }}>100.00</span>
        <span style={rightCol}>100.00</span>
        <span style={rightCol}>10,000.00</span>
      </div>
      <div style={{ color: TEXT_MUTED, fontStyle: "italic", paddingLeft: 15 }}>Brittania Chococlate Cake description</div>
      <div style={{ color: TEXT_MUTED, paddingLeft: 15, fontSize: 8.5 }}>Batch No.: N1234, Model No.: A12345, Exp. <EditableText textKey="lbl_date" defaultText="Date:" /> 08/2027, Mfg. <EditableText textKey="lbl_date" defaultText="Date:" /> 12/08/2026, Size: Med/32</div>
      <div style={{ display: "flex", paddingLeft: 15, justifyContent: "flex-end" }}><span style={{ color: TEXT_MUTED, marginRight: 8 }}>Final amount :</span> 10,000.00</div>
      
      <div style={{ display: "flex", marginTop: 4 }}>
        <span style={{ width: 15 }}>2</span>
        <span style={{ flex: 1 }}>Cadbury Chocolate</span>
      </div>
      <div style={{ display: "flex", paddingLeft: 15 }}>
        <span style={{ flex: 1 }}>50 + 1Pac</span>
        <span style={{ width: 40, textAlign: "right" }}>150.00</span>
        <span style={rightCol}>150.00</span>
        <span style={rightCol}>7,500.00</span>
      </div>
      <div style={{ color: TEXT_MUTED, fontStyle: "italic", paddingLeft: 15 }}>Cadbury cake description</div>
      <div style={{ display: "flex", paddingLeft: 15, justifyContent: "flex-end" }}><span style={{ color: TEXT_MUTED, marginRight: 8 }}>Final amount :</span> 7,500.00</div>
      
      <div style={dash} />
      <div style={{ display: "flex", fontWeight: 600 }}>
        <span style={{ flex: 1 }}>Qty: 150 + 1</span>
        <span style={{ flex: 1, textAlign: "center" }}></span>
        <span style={{ ...rightCol, width: 80 }}>17,500.00</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 4 }}>
        <div style={{ display: "flex", width: 160 }}><span style={{ flex: 1 }}>Disc.(0%) :</span><span style={{ width: 60, textAlign: "right" }}>-500.00</span></div>
        <div style={{ display: "flex", width: 160 }}><span style={{ flex: 1 }}>Tax(0%) :</span><span style={{ width: 60, textAlign: "right" }}>500.00</span></div>
        <div style={{ display: "flex", width: 160 }}><span style={{ flex: 1 }}>Total Disc. :</span><span style={{ width: 60, textAlign: "right" }}>-1,350.00</span></div>
        <div style={{ display: "flex", width: 160, fontWeight: 600 }}><span style={{ flex: 1 }}>Total :</span><span style={{ width: 60, textAlign: "right" }}>20,000.00</span></div>
        <div style={{ display: "flex", width: 160 }}><span style={{ flex: 1 }}><EditableText textKey="lbl_received_no_colon" defaultText="Received" /> :</span><span style={{ width: 60, textAlign: "right" }}>20,000.00</span></div>
        <div style={{ display: "flex", width: 160 }}><span style={{ flex: 1 }}><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /> :</span><span style={{ width: 60, textAlign: "right" }}>0.00</span></div>
      </div>
      
      <div style={dash} />
      <div style={{ textAlign: "center" }}><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /> to be paid in 3 days</div>
    </div>
  );
}
