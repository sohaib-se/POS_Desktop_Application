import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, TEXT_MUTED } from "./constants";
import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_THERMAL_SALE } from "./DummySaleData";

export function ThermalTheme3Preview({ sale }: { sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_THERMAL_SALE;
  const { companyName, phone, showCompanyName, showPhone, companyNameTextSize, invoiceTextSize, thermalFontSizeOffset, thermalTextBold } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const baseInvoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;
  const invoiceFontSize = baseInvoiceFontSize + thermalFontSizeOffset;

  const dash: React.CSSProperties = { borderTop: `1px dashed ${TEXT_DARK}`, margin: "8px 0" };
  const rightCol = { width: 60, textAlign: "right" as const };

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px", fontFamily: "Inter, system-ui, sans-serif", fontSize: invoiceFontSize, color: TEXT_DARK, width: "100%", margin: "0 auto", lineHeight: 1.4, fontWeight: thermalTextBold ? 600 : 400, overflowX: "hidden", wordBreak: "break-word" }}>
      {/* Header */}
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: companyNameSize }}>{showCompanyName ? companyName : ""}</div>
      {showPhone && (<div style={{ textAlign: "center" }}>Ph.No.: {phone}</div>)}
      
      <div style={dash} />
      <div style={{ textAlign: "center", fontWeight: 600 }}><EditableText textKey="lbl_invoice" defaultText="Invoice" /></div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
        <div style={{ flex: 1, fontWeight: 600 }}>{data.partyName}</div>
        <div style={{ textAlign: "right" }}>
          <div><EditableText textKey="lbl_date" defaultText="Date:" /> {data.date}</div>
          <div><EditableText textKey="lbl_inv_no" defaultText="Invoice No.:" /> {data.invoiceNo}</div>
        </div>
      </div>
      
      <div style={dash} />
      
      <div style={{ display: "flex", fontWeight: 600 }}>
        <span style={{ width: 20 }}>#</span>
        <span style={{ flex: 1 }}>
          <div>Item Name</div>
          <div>Qty</div>
        </span>
        <span style={{ ...rightCol, alignSelf: "flex-end" }}>Price</span>
        <span style={{ ...rightCol, alignSelf: "flex-end" }}>Amount</span>
      </div>
      
      <div style={dash} />
      
      {data.lineItems.map((item, idx) => (
        <div key={item.id ?? idx} style={{ display: "flex", marginTop: 4 }}>
          <span style={{ width: 20 }}>{idx + 1}</span>
          <span style={{ flex: 1 }}>
            <div>{item.name}</div>
            <div>{item.quantity}{item.unit !== "NONE" ? item.unit : ""}</div>
          </span>
          <span style={{ ...rightCol, alignSelf: "flex-start" }}>{item.price.toFixed(2)}</span>
          <span style={{ ...rightCol, alignSelf: "flex-start" }}>{item.amount.toFixed(2)}</span>
        </div>
      ))}
      
      <div style={dash} />
      
      <div style={{ display: "flex", fontWeight: 600 }}>
        <span style={{ flex: 1 }}>Qty: {data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
        <span style={{ ...rightCol, width: 120 }}>{data.subtotal.toFixed(2)}</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8, paddingLeft: 60 }}>
        {data.discountAmount > 0 && (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ flex: 1 }}><EditableText textKey="lbl_discount" defaultText="Discount" /> {data.discountPercent > 0 ? `(${data.discountPercent}%)` : ""}</span>
            <span style={{ width: 10, textAlign: "center" }}>:</span>
            <span style={{ width: 60, textAlign: "right" }}>-{data.discountAmount.toFixed(2)}</span>
          </div>
        )}
        {data.taxAmount > 0 && (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ flex: 1 }}>{data.taxLabel || "Tax"}</span>
            <span style={{ width: 10, textAlign: "center" }}>:</span>
            <span style={{ width: 60, textAlign: "right" }}>{data.taxAmount.toFixed(2)}</span>
          </div>
        )}
        {data.roundOff && (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ flex: 1 }}><EditableText textKey="lbl_round_off" defaultText="Round off" /></span>
            <span style={{ width: 10, textAlign: "center" }}>:</span>
            <span style={{ width: 60, textAlign: "right" }}>{data.roundOffAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", fontWeight: 600 }}>
          <span style={{ flex: 1 }}><EditableText textKey="lbl_total" defaultText="Total" /></span>
          <span style={{ width: 10, textAlign: "center" }}>:</span>
          <span style={{ width: 60, textAlign: "right" }}>{data.grandTotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
          <span style={{ flex: 1 }}><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span>
          <span style={{ width: 10, textAlign: "center" }}>:</span>
          <span style={{ width: 60, textAlign: "right" }}>{data.received.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
          <span style={{ flex: 1 }}><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span>
          <span style={{ width: 10, textAlign: "center" }}>:</span>
          <span style={{ width: 60, textAlign: "right" }}>{data.balance.toFixed(2)}</span>
        </div>
      </div>
      
      {data.description && (
        <>
          <div style={dash} />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>Description</div>
            <div>{data.description}</div>
          </div>
        </>
      )}

      {data.termsAndConditions && (
        <>
          <div style={dash} />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontWeight: 600 }}>Terms and Conditions</div>
            <div>{data.termsAndConditions}</div>
          </div>
        </>
      )}
      
      <br/>
    </div>
  );
}
