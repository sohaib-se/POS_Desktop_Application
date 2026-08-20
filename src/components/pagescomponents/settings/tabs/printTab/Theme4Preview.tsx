import type { BillPreviewSaleData } from "./BillPreviewData";
import { DUMMY_REGULAR_SALE } from "./DummySaleData";
import { EditableText, numberToWords } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, resolveThemeColor } from "./constants";

export function Theme4Preview({ color, sale }: { color?: string; sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_REGULAR_SALE;
  const {
    companyName, phone, logo, showCompanyName, showPhone, showLogo, companyNameTextSize, invoiceTextSize,
  } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 25 : companyNameTextSize === "Large" ? 40 : 33;
  const invoiceFontSize = invoiceTextSize === "Small" ? 15.5 : invoiceTextSize === "Large" ? 21 : 18;

  const themeBg = color || "#a855f7";
  const borderColor = resolveThemeColor(themeBg); // black when white is selected

  const d = data as any;
  const shippingAddress: string | undefined = d.shippingAddress;
  const time: string | undefined = d.time;
  const dueDate: string | undefined = d.dueDate;
  const taxBreakdown: Array<{ type: string; taxableAmount: number; rate: string; taxAmount: number }> | undefined = d.taxBreakdown;
  const savedAmount: number | undefined = d.savedAmount;
  const bankDetails: { bankName?: string; accountNo?: string; ifsc?: string; iban?: string } | undefined = d.bankDetails;

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", maxHeight: "100%" }}>
      <div className="print-scroll-area" style={{ width: "calc(115.5mm + 8px)", maxHeight: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
        <div style={{ width: "115.5mm", minHeight: "163.35mm" }}>
        <div style={{ background: "#fff", padding: 30, fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #e2e8f0", width: "210mm", minHeight: "297mm", boxSizing: "border-box", zoom: 0.55 }}>

          {/* Header — company name left, logo right (Theme4 signature) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK }}>{showCompanyName ? companyName : ""}</div>
              {showPhone && <div style={{ fontSize: invoiceFontSize, color: themeBg, marginTop: 4, fontWeight: 600 }}>Ph. no.: {phone}</div>}
            </div>
            {showLogo && (
              <div style={{ width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                {logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderBottom: `2px solid ${borderColor}`, marginBottom: 16 }} />

          {/* Title — large colored text, no border box */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: themeBg }}>
              <EditableText textKey="title" defaultText="Sale" />
            </div>
          </div>

          {/* Bill To / Shipping To / Invoice Details */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 16, fontSize: invoiceFontSize }}>
            {/* Bill To */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}>
                <EditableText textKey="lbl_bill_to" defaultText="Bill To:" />
              </div>
              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 2 }}>{data.partyName}</div>
              {d.partyAddress && <div style={{ color: TEXT_DARK, marginBottom: 2 }}>{d.partyAddress}</div>}
              {d.partyPhone && <div style={{ color: TEXT_DARK }}>Contact No.: {d.partyPhone}</div>}
            </div>

            {/* Shipping To */}
            {shippingAddress && (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}>
                  <EditableText textKey="lbl_shipping_to" defaultText="Shipping To" />
                </div>
                <div style={{ color: TEXT_DARK }}>{shippingAddress}</div>
              </div>
            )}

            {/* Invoice Details — right, values in theme color */}
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 4 }}>
                  <EditableText textKey="lbl_invoice_details" defaultText="Invoice Details" />
                </div>
                <div style={{ marginBottom: 2, color: TEXT_DARK }}>Invoice No.: <span style={{ color: themeBg }}>{data.invoiceNo}</span></div>
                <div style={{ marginBottom: 2, color: TEXT_DARK }}>Date: <span style={{ color: themeBg }}>{data.date}</span></div>
                {time && <div style={{ marginBottom: 2, color: TEXT_DARK }}>Time: <span style={{ color: themeBg }}>{time}</span></div>}
                {dueDate && <div style={{ color: TEXT_DARK }}>Due Date: <span style={{ color: themeBg }}>{dueDate}</span></div>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr style={{ background: themeBg, borderBottom: `2px solid ${borderColor}` }}>
                <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 700, color: "#fff" }}>#</th>
                <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 700, color: "#fff" }}>Item name</th>
                <th style={{ padding: "8px 6px", textAlign: "center", fontWeight: 700, color: "#fff" }}>Quantity</th>
                <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700, color: "#fff" }}>Price/unit</th>
                <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700, color: "#fff" }}>Discount</th>
                <th style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700, color: "#fff" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => {
                const it = item as any;
                return (
                  <tr key={item.id ?? idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 6px", color: TEXT_DARK }}>{idx + 1}</td>
                    <td style={{ padding: "8px 6px", color: themeBg, fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: "8px 6px", textAlign: "center", color: TEXT_DARK }}>{item.quantity}{item.unit !== "NONE" ? ` ${item.unit}` : ""}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {item.price.toFixed(2)}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right", color: TEXT_DARK }}>
                      {it.discountAmount ? `Rs ${it.discountAmount.toFixed(2)}${it.discountPercent ? ` (${it.discountPercent}%)` : ""}` : "Rs 0.00"}
                    </td>
                    <td style={{ padding: "8px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {item.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, fontWeight: 700 }}>
                <td colSpan={2} style={{ padding: "8px 6px", color: TEXT_DARK }}>Total</td>
                <td style={{ padding: "8px 6px", textAlign: "center", color: TEXT_DARK }}>{data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td />
                <td style={{ padding: "8px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {(data.discountAmount ?? 0).toFixed(2)}</td>
                <td style={{ padding: "8px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {data.subtotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Tax Breakdown + Amounts */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            {taxBreakdown && taxBreakdown.length > 0 && (
              <table style={{ flex: 1, fontSize: invoiceFontSize, borderCollapse: "collapse", alignSelf: "flex-start" }}>
                <thead>
                  <tr style={{ background: themeBg, borderBottom: `2px solid ${borderColor}` }}>
                    <th style={{ padding: "6px 6px", textAlign: "left", color: "#fff", fontWeight: 700 }}>Tax type</th>
                    <th style={{ padding: "6px 6px", textAlign: "right", color: "#fff", fontWeight: 700 }}>Taxable amount</th>
                    <th style={{ padding: "6px 6px", textAlign: "right", color: "#fff", fontWeight: 700 }}>Rate</th>
                    <th style={{ padding: "6px 6px", textAlign: "right", color: "#fff", fontWeight: 700 }}>Tax amount</th>
                  </tr>
                </thead>
                <tbody>
                  {taxBreakdown.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 6px", color: TEXT_DARK }}>{row.type}</td>
                      <td style={{ padding: "6px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {row.taxableAmount.toFixed(2)}</td>
                      <td style={{ padding: "6px 6px", textAlign: "right", color: TEXT_DARK }}>{row.rate}</td>
                      <td style={{ padding: "6px 6px", textAlign: "right", color: TEXT_DARK }}>Rs {row.taxAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Amounts — plain rows, no header bar */}
            <div style={{ width: 260, fontSize: invoiceFontSize, marginLeft: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                <span>Sub Total</span><span>Rs {data.subtotal.toFixed(2)}</span>
              </div>
              {data.discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                  <span>Discount {data.discountPercent > 0 ? `(${data.discountPercent}%)` : ""}</span>
                  <span>Rs {data.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {data.taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                  <span>{data.taxLabel || "Tax"}</span><span>Rs {data.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {data.roundOff && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                  <span>Round off</span><span>Rs {data.roundOffAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 700, color: TEXT_DARK, borderBottom: `2px solid ${borderColor}` }}>
                <span>Total</span><span>Rs {data.grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                <span>Received</span><span>Rs {data.received.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK, borderBottom: "1px solid #f1f5f9" }}>
                <span>Balance</span><span>Rs {data.balance.toFixed(2)}</span>
              </div>
              {typeof savedAmount === "number" && savedAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 2px", fontWeight: 700, color: TEXT_DARK }}>
                  <span>You Saved</span><span>Rs {savedAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount in Words — inline style (bold label + plain text) */}
          <div style={{ fontSize: invoiceFontSize, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: TEXT_DARK }}>
              <EditableText textKey="lbl_amount_words_no_colon" defaultText="Invoice Amount In Words" />
            </span>{" "}
            <span style={{ color: TEXT_DARK }}>{numberToWords(data.grandTotal)} only</span>
          </div>

          {/* Description */}
          {data.description && (
            <div style={{ fontSize: invoiceFontSize, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: TEXT_DARK }}>
                <EditableText textKey="lbl_desc_no_colon" defaultText="Description" />
              </span>{" "}
              <span style={{ color: TEXT_DARK }}>{data.description}</span>
            </div>
          )}

          {/* Terms and Conditions */}
          {data.termsAndConditions && (
            <div style={{ fontSize: invoiceFontSize, marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: TEXT_DARK }}>
                <EditableText textKey="lbl_terms_upper" defaultText="Terms and conditions" />
              </span>{" "}
              <span style={{ color: themeBg }}>{data.termsAndConditions}</span>
            </div>
          )}

          {/* Bank Details */}
          {bankDetails && (
            <div style={{ fontSize: invoiceFontSize, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 6 }}>
                <EditableText textKey="lbl_bank_details" defaultText="Bank Details" />
              </div>
              <div style={{ color: themeBg }}>
                {bankDetails.bankName && <div>Bank Name: {bankDetails.bankName}</div>}
                {bankDetails.accountNo && <div>Bank Account No.: {bankDetails.accountNo}</div>}
                {bankDetails.ifsc && <div>Bank IFSC code: {bankDetails.ifsc}</div>}
                {bankDetails.iban && <div>IBAN: {bankDetails.iban}</div>}
              </div>
            </div>
          )}

          {/* Footer / Signatory */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center", fontSize: invoiceFontSize }}>
              <div style={{ color: TEXT_DARK, marginBottom: 8 }}>For : {showCompanyName ? companyName : ""}</div>
              <div style={{ width: 100, height: 60, background: "#f1f5f9", margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 700, color: TEXT_DARK }}>Authorized Signatory</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

