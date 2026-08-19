import { EditableText, PrintPreviewContext } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, TEXT_MUTED } from "./constants";
import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { useContext } from "react";

export function ThermalReceiptPreview({ children }: { sale?: BillPreviewSaleData, children?: React.ReactNode }) {
  const { companyName, phone, address, updateDetail, showCompanyName, showPhone, showAddress , companyNameTextSize, invoiceTextSize } = useCompanyDetails();
  const { isReadOnly } = useContext(PrintPreviewContext);

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const dash: React.CSSProperties = {
    borderTop: `1px dashed ${TEXT_MUTED}`,
    margin: "6px 0" };
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px 14px",
        fontFamily: "'Courier New', monospace",
        fontSize: invoiceFontSize,
        color: TEXT_DARK,
        width: "100%",
        margin: "0 auto" }}
    >
      {showCompanyName && ( <div style={{ border: "1px solid #000", textAlign: "center", fontWeight: 700, fontSize: companyNameSize }}>{showCompanyName ? companyName : ""}</div> )}
      {showPhone && ( <div style={{ textAlign: "center", color: TEXT_MUTED }}>Ph No: {showPhone ? phone : ""}</div> )}
      {children ? children : (
        <>
      <div style={dash} />
      <div style={{ fontWeight: 700 }}>Invoice</div>
      <div>Party that user select at time of sale.</div>
      <div>Ph No: (+971) 4 549 0404</div>
      <div><EditableText textKey="lbl_bill_to" defaultText="Bill To:" /></div>
      {showAddress && ( <div><span contentEditable={!isReadOnly} suppressContentEditableWarning onBlur={(e) => { if (!isReadOnly) updateDetail("address", e.currentTarget.textContent || ""); }} style={{ cursor: isReadOnly ? "default" : "text", outline: "none" }}>{address}</span></div> )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><EditableText textKey="lbl_date" defaultText="Date:" /> 11/08/2026</span>
        <span>Invoice No: Inv12345</span>
      </div>
      <div style={dash} />
      <div style={{ display: "flex", fontWeight: 700 }}>
        <span style={{ flex: 1 }}>Item Name</span>
        <span>Amount</span>
      </div>
      <div>1&nbsp;&nbsp;Britannia Chocolate Cake</div>
      <div style={{ color: TEXT_MUTED }}>Britannia Chocolate Cake description</div>
      <div style={{ color: TEXT_MUTED }}>Batch No: N1234, Model No: A12345, Exp. <EditableText textKey="lbl_date" defaultText="Date:" /> 08/2027, Mfg. <EditableText textKey="lbl_date" defaultText="Date:" /> 11/08/2026, Size: Med/32</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>100 + Discount</span>
        <span>10,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Final amount</span>
        <span>10,000.00</span>
      </div>
      <div>2&nbsp;&nbsp;Cadbury Chocolate</div>
      <div style={{ color: TEXT_MUTED }}>Cadbury cake description</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>50 + 1 Discount</span>
        <span>7,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Final amount</span>
        <span>7,500.00</span>
      </div>
      <div style={dash} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Qty: 150 + 1</span>
        <span>17,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Discount(0%)</span>
        <span>-500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Tax(0%)</span>
        <span>500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Total Discount</span>
        <span>-1,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span><EditableText textKey="lbl_total" defaultText="Total" /></span>
        <span>20,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span>
        <span>20,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span>
        <span>0.00</span>
      </div>
      <div style={dash} />
      <div style={{ textAlign: "center" }}><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /> to be paid in 5 days.</div>
        </>
      )}
    </div>
  );
}
