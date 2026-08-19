import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_REGULAR_SALE } from "./DummySaleData";
import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function TaxTheme3Preview({ color, sale }: { color?: string, sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_REGULAR_SALE;
  const { companyName, phone, logo, showCompanyName, showPhone, showLogo, companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const greyBg = color || "#f3f4f6";
  const th: React.CSSProperties = {
    padding: "4px 6px",
    textAlign: "left",
    fontWeight: 600,
    color: color ? "#fff" : TEXT_DARK,
    borderRight: `1px solid ${BORDER}`
  };
  const td: React.CSSProperties = { padding: "4px 6px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };

  return (
    <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", width: "100%", display: "flex", justifyContent: "center" }}>
      <div className="print-scroll-area" style={{ border: "1px solid #000", background: "#fff", padding: 20, fontFamily: "Inter, system-ui, sans-serif", width: "100%", maxWidth: "800px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {showLogo && (
            <div
              style={{
                width: 100,
                height: 100,
                background: greyBg,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: invoiceFontSize,
                color: TEXT_MUTED, overflow: "hidden"
              }}>
              {logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
          )}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK }}>{showCompanyName ? companyName : ""}</div>
            {showPhone && (<div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>Ph. no.: {showPhone ? phone : ""}</div>)}
          </div>
        </div>

        <div style={{ textAlign: "center", fontWeight: 600, fontSize: companyNameSize, marginBottom: 10 }}>
          <EditableText textKey="title" defaultText="Sales" />
        </div>

        <>
          <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 0 }}>
            <thead>
              <tr style={{ background: greyBg, color: TEXT_DARK }}>
                {["#", <EditableText textKey="th_item_name" defaultText="Item name" />, <EditableText textKey="th_hsn" defaultText="HSN/SAC" />, <EditableText textKey="th_qty" defaultText="Quantity" />, <EditableText textKey="th_price" defaultText="Price/unit" />].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
                {data.discountAmount > 0 && <th style={th}><EditableText textKey="th_discount" defaultText="Discount" /></th>}
                {data.taxAmount > 0 && <th style={th}><EditableText textKey="th_tax" defaultText="GST" /></th>}
                <th style={th}><EditableText textKey="th_amount" defaultText="Amount" /></th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td style={td}>{idx + 1}</td>
                  <td style={td}>{item.name}</td>
                  <td style={td}></td>
                  <td style={td}>{item.quantity} {item.unit !== "NONE" ? item.unit : ""}</td>
                  <td style={td}>Rs {item.price.toFixed(2)}</td>
                  {data.discountAmount > 0 && <td style={td}>Rs {((item.price * item.quantity) * (data.discountPercent / 100)).toFixed(2)}</td>}
                  {data.taxAmount > 0 && <td style={td}>Rs {((item.price * item.quantity) * data.taxRate).toFixed(2)}</td>}
                  <td style={{ ...td, borderRight: "none" }}>Rs {item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600 }}>
                <td style={td} colSpan={3}><EditableText textKey="lbl_total" defaultText="Total" /></td>
                <td style={td}>{data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td style={td} />
                {data.discountAmount > 0 && <td style={td}>Rs {(data.discountAmount || 0).toFixed(2)}</td>}
                {data.taxAmount > 0 && <td style={td}>Rs {(data.taxAmount || 0).toFixed(2)}</td>}
                <td style={{ ...td, borderRight: "none" }}>Rs {data.subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", fontSize: invoiceFontSize, border: `1px solid ${BORDER}`, borderTop: "none", marginBottom: 10 }}>
            <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: "4px 6px" }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Invoice Amount In Words</div>
              <div style={{ color: TEXT_MUTED, marginBottom: 10 }}>Forty Two Rupees and Thirty Two Paisa only</div>

              {data.description && (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}><EditableText textKey="lbl_desc_no_colon" defaultText="Description" /></div>
                  <div style={{ color: TEXT_MUTED }}>{data.description}</div>
                </>
              )}
            </div>
            <div style={{ width: 180, padding: "4px 6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Amounts</span><span></span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_sub_total" defaultText="Sub Total" /></span><span>Rs {data.subtotal.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount</span><span>Rs {(data.discountAmount || 0).toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>{data.taxLabel}</span><span>Rs {(data.taxAmount || 0).toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, paddingTop: 2, marginBottom: 2 }}><span><EditableText textKey="lbl_total" defaultText="Total" /></span><span>Rs {data.grandTotal.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span><span>Rs {data.received.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span><span>Rs {data.balance.toFixed(2)}</span></div>
              {data.discountAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span><EditableText textKey="lbl_saved_no_colon" defaultText="You Saved" /></span><span>Rs {(data.discountAmount || 0).toFixed(2)}</span></div>}
            </div>
          </div>

          {data.taxAmount > 0 && (
            <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: greyBg }}>
                  <th rowSpan={2} style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>HSN/ SAC</th>
                  <th rowSpan={2} style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Taxable amount</th>
                  <th colSpan={2} style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}`, textAlign: "center" }}>CGST</th>
                  <th colSpan={2} style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}`, textAlign: "center" }}>SGST</th>
                  <th rowSpan={2} style={{ padding: "2px 4px" }}>Total Tax Amount</th>
                </tr>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: greyBg }}>
                  <th style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rate</th>
                  <th style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Amount</th>
                  <th style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rate</th>
                  <th style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }} />
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {(data.subtotal).toFixed(2)}</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>{(data.taxRate * 100 / 2).toFixed(1)}%</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {(data.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>{(data.taxRate * 100 / 2).toFixed(1)}%</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {(data.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: "2px 4px" }}>Rs {data.taxAmount.toFixed(2)}</td>
                </tr>
                <tr style={{ fontWeight: 600, borderTop: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}><EditableText textKey="lbl_total" defaultText="Total" /></td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {data.subtotal.toFixed(2)}</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }} />
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {(data.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }} />
                  <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs {(data.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: "2px 4px" }}>Rs {data.taxAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}

          <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}` }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px", borderRight: `1px solid ${BORDER}`, width: "33%", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>Bank Details</div>
                  <div style={{ color: TEXT_MUTED }}>Bank Name: 123123123123</div>
                  <div style={{ color: TEXT_MUTED }}>Bank Account No.: 12312312312</div>
                  <div style={{ color: TEXT_MUTED }}>Bank IFSC code: 123123123</div>
                  <div style={{ color: TEXT_MUTED }}>IBAN: AE12 3456 7890 1234 5678 901</div>
                </td>
                {data.termsAndConditions && (
                  <td style={{ padding: "8px", borderRight: `1px solid ${BORDER}`, width: "33%", verticalAlign: "top" }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Terms and conditions:</div>
                    <div style={{ color: TEXT_MUTED }}>{data.termsAndConditions}</div>
                  </td>
                )}
                <td style={{ padding: "8px", verticalAlign: "top", textAlign: "center" }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, textAlign: "left" }}><EditableText textKey="lbl_for" defaultText="For:" /> {showCompanyName ? companyName : ""}</div>
                  <div
                    style={{
                      width: 60,
                      height: 30,
                      background: greyBg,
                      display: "inline-block",
                      marginBottom: 6
                    }}
                  />
                  <div style={{ color: TEXT_MUTED }}><EditableText textKey="lbl_auth_sig" defaultText="Authorized Signatory" /></div>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      </div>
    </div>
  );
}
