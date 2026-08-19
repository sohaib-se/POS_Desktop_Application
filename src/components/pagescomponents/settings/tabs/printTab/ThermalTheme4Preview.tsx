import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, TEXT_MUTED } from "./constants";
import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_THERMAL_SALE } from "./DummySaleData";

export function ThermalTheme4Preview({ sale }: { sale?: BillPreviewSaleData }) {
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
      
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: invoiceFontSize * 0.9 }}>
        <div><EditableText textKey="lbl_inv_no" defaultText="Invoice No.:" /> {data.invoiceNo}</div>
        <div><EditableText textKey="lbl_date" defaultText="Date:" /> {data.date}</div>
      </div>
      
      <div style={dash} />
      
      <div style={{ textAlign: "center", fontSize: invoiceFontSize * 0.9 }}>
        <div style={{ fontWeight: 600 }}>{data.partyName}</div>
        {data.partyPhone && <div>Ph. No.: {data.partyPhone}</div>}
      </div>
      <div style={{ marginTop: 4, fontSize: invoiceFontSize * 0.9 }}>
        <div style={{ fontWeight: 600 }}>Bill To:</div>
        <div>Sarjapur Road, Bangalore</div>
      </div>
      
      <div style={dash} />
      
      <div style={{ display: "flex", fontWeight: 600, fontSize: invoiceFontSize * 0.9, flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          <span style={{ width: 24 }}>#</span>
          <span style={{ flex: 1 }}>Item Name</span>
        </div>
        <div style={{ display: "flex", paddingLeft: 24, marginTop: 2 }}>
          <span style={{ width: 100 }}>Qty</span>
          <span style={{ flex: 1, textAlign: "left" }}>MRP</span>
          <span style={rightCol}>Price</span>
          <span style={rightCol}>Amount</span>
        </div>
      </div>
      
      <div style={dash} />
      
      {data.lineItems.map((item, idx) => {
        return (
          <div key={item.id ?? idx} style={{ display: "flex", flexDirection: "column", marginTop: 6, fontSize: invoiceFontSize * 0.9 }}>
            <div style={{ display: "flex" }}>
              <span style={{ width: 24 }}>{idx + 1}</span>
              <span style={{ flex: 1 }}>{item.name}</span>
            </div>
            <div style={{ display: "flex", paddingLeft: 24, marginTop: 2 }}>
              <span style={{ width: 100 }}>{item.quantity} + 0{item.unit !== "NONE" ? item.unit : "Box"}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{item.price.toFixed(2)}</span>
              <span style={rightCol}>{item.price.toFixed(2)}</span>
              <span style={rightCol}>{item.amount.toFixed(2)}</span>
            </div>
            
            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginTop: 2, paddingLeft: 24, fontSize: invoiceFontSize * 0.85 }}>
              <span style={{ flex: 1, textAlign: "right" }}>Final amount</span>
              <span style={{ width: 10, textAlign: "center" }}>:</span>
              <span style={{ width: 60, textAlign: "right" }}>{item.amount.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
      
      <div style={dash} />
      
      <div style={{ display: "flex", fontWeight: 700, fontSize: invoiceFontSize * 0.9 }}>
        <span style={{ flex: 1 }}>Qty: {data.lineItems.reduce((sum, i) => sum + i.quantity, 0)} + 1</span>
        <span style={{ ...rightCol, width: 100 }}>{data.subtotal.toFixed(2)}</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 4, paddingLeft: 40, fontSize: invoiceFontSize * 0.9 }}>
        {data.discountAmount > 0 && (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ flex: 1, textAlign: "right" }}><EditableText textKey="lbl_discount" defaultText="Disc." />(0%)</span>
            <span style={{ width: 20, textAlign: "center" }}>:</span>
            <span style={{ width: 80, textAlign: "right" }}>-500.00</span>
          </div>
        )}
        {data.taxAmount > 0 && (
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
            <span style={{ flex: 1, textAlign: "right" }}>{data.taxLabel || "Tax"}(0%)</span>
            <span style={{ width: 20, textAlign: "center" }}>:</span>
            <span style={{ width: 80, textAlign: "right" }}>500.00</span>
          </div>
        )}
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
          <span style={{ flex: 1, textAlign: "right" }}>Total Disc.</span>
          <span style={{ width: 20, textAlign: "center" }}>:</span>
          <span style={{ width: 80, textAlign: "right" }}>-1,350.00</span>
        </div>
        
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", fontWeight: 700, marginTop: 2 }}>
          <span style={{ flex: 1, textAlign: "right" }}><EditableText textKey="lbl_total" defaultText="Total" /></span>
          <span style={{ width: 20, textAlign: "center" }}>:</span>
          <span style={{ width: 80, textAlign: "right" }}>{data.grandTotal.toFixed(2)}</span>
        </div>
        
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ flex: 1, textAlign: "right" }}><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span>
          <span style={{ width: 20, textAlign: "center" }}>:</span>
          <span style={{ width: 80, textAlign: "right" }}>{data.received.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
          <span style={{ flex: 1, textAlign: "right" }}><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span>
          <span style={{ width: 20, textAlign: "center" }}>:</span>
          <span style={{ width: 80, textAlign: "right" }}>{data.balance.toFixed(2)}</span>
        </div>
      </div>
      
      <div style={dash} />
      
      <div style={{ fontSize: invoiceFontSize * 0.9, marginTop: 4, textAlign: "center" }}>
        Balance to be paid in 3 days
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
