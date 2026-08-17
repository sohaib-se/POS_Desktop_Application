import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_REGULAR_SALE } from "./DummySaleData";
import { EditableText, numberToWords } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK } from "./constants";

export function Theme2Preview({ color, sale }: { color?: string, sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_REGULAR_SALE;
  const { companyName, phone, logo, showCompanyName, showPhone, showLogo, companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const themeBg = color || "#a855f7"; // Purple

  return (
    <div style={{ background: "#fff", padding: 30, fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #e2e8f0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        {showLogo && (
          <div style={{ width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
          </div>
        )}
        <div style={{ textAlign: "right", flex: 1 }}>
          <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK }}>{showCompanyName ? companyName : ""}</div>
          {showPhone && (<div style={{ fontSize: invoiceFontSize, color: TEXT_DARK, marginTop: 4 }}>Phone no.: {phone}</div>)}
        </div>
      </div>
      
      {/* Title */}
      <div style={{ background: themeBg, textAlign: "center", padding: "6px 0", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}><EditableText textKey="title" defaultText="Invoice" /></div>
      </div>
      
      {/* Bill To & Invoice Details */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: invoiceFontSize, fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}><EditableText textKey="lbl_bill_to" defaultText="Bill To" /></div>
          <div style={{ fontSize: invoiceFontSize, fontWeight: 600, color: TEXT_DARK }}>{data.partyName}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: invoiceFontSize, color: TEXT_DARK }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: TEXT_DARK }}><EditableText textKey="lbl_invoice_details" defaultText="Invoice Details" /></div>
          <div style={{ marginBottom: 2 }}>Invoice No.: {data.invoiceNo}</div>
          <div>Date: {data.date}</div>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ borderTop: `2px solid ${themeBg}`, borderBottom: `2px solid ${themeBg}` }}>
            <th style={{ padding: "8px 4px", textAlign: "left", fontWeight: 700, color: TEXT_DARK }}>#</th>
            <th style={{ padding: "8px 4px", textAlign: "left", fontWeight: 700, color: TEXT_DARK }}>Item name</th>
            <th style={{ padding: "8px 4px", textAlign: "center", fontWeight: 700, color: TEXT_DARK }}>Quantity</th>
            <th style={{ padding: "8px 4px", textAlign: "center", fontWeight: 700, color: TEXT_DARK }}>Unit</th>
            <th style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700, color: TEXT_DARK }}>Price/ Unit</th>
            <th style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700, color: TEXT_DARK }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, idx) => (
            <tr key={item.id ?? idx}>
              <td style={{ padding: "8px 4px", color: TEXT_DARK }}>{idx + 1}</td>
              <td style={{ padding: "8px 4px", color: TEXT_DARK }}>{item.name}</td>
              <td style={{ padding: "8px 4px", textAlign: "center", color: TEXT_DARK }}>{item.quantity}</td>
              <td style={{ padding: "8px 4px", textAlign: "center", color: TEXT_DARK }}>{item.unit !== "NONE" ? item.unit : ""}</td>
              <td style={{ padding: "8px 4px", textAlign: "right", color: TEXT_DARK }}>Rs {item.price.toFixed(2)}</td>
              <td style={{ padding: "8px 4px", textAlign: "right", color: TEXT_DARK }}>Rs {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${themeBg}`, borderBottom: `2px solid ${themeBg}`, fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: "8px 4px", color: TEXT_DARK }}>Total</td>
            <td style={{ padding: "8px 4px", textAlign: "center", color: TEXT_DARK }}>{data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</td>
            <td colSpan={2} style={{ padding: "8px 4px" }}></td>
            <td style={{ padding: "8px 4px", textAlign: "right", color: TEXT_DARK }}>Rs {data.subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Footer Details */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, alignItems: "flex-start" }}>
        <div style={{ flex: 1, paddingRight: 20 }}>
          <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}><EditableText textKey="lbl_amount_words_no_colon" defaultText="Invoice Amount In Words" /></div>
          <div style={{ color: TEXT_DARK, marginBottom: 20 }}>{numberToWords(data.grandTotal)} Rupees only</div>
          
          {data.description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}><EditableText textKey="lbl_desc_no_colon" defaultText="Description" /></div>
              <div style={{ color: TEXT_DARK }}>{data.description}</div>
            </div>
          )}
          
          {data.termsAndConditions && (
            <div>
              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}><EditableText textKey="lbl_terms_upper" defaultText="TERMS AND CONDITIONS" /></div>
              <div style={{ color: TEXT_DARK }}>{data.termsAndConditions}</div>
            </div>
          )}
        </div>
        <div style={{ width: 250 }}>
          <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 8, textAlign: "center" }}><EditableText textKey="lbl_amounts" defaultText="Amounts" /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><EditableText textKey="lbl_sub_total" defaultText="Sub Total" /></span>
            <span>Rs {data.subtotal.toFixed(2)}</span>
          </div>
          {data.discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span><EditableText textKey="lbl_discount" defaultText="Discount" /> {data.discountPercent > 0 ? `(${data.discountPercent}%)` : ""}</span>
              <span>-Rs {data.discountAmount.toFixed(2)}</span>
            </div>
          )}
          {data.taxAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{data.taxLabel || "Tax"}</span>
              <span>Rs {data.taxAmount.toFixed(2)}</span>
            </div>
          )}
          {data.roundOff && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span><EditableText textKey="lbl_round_off" defaultText="Round off" /></span>
              <span>Rs {data.roundOffAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontWeight: 700 }}>
            <span><EditableText textKey="lbl_total" defaultText="Total" /></span>
            <span>Rs {data.grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span>
            <span>Rs {data.received.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span>
            <span>Rs {data.balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
