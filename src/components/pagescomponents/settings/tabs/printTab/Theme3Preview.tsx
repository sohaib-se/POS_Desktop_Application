import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_REGULAR_SALE } from "./DummySaleData";
import { EditableText, numberToWords } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { TEXT_DARK, resolveThemeColor } from "./constants";

export function Theme3Preview({ color, sale }: { color?: string; sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_REGULAR_SALE;
  const {
    companyName, phone, logo, showCompanyName, showPhone, showLogo, companyNameTextSize, invoiceTextSize,
  } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 25 : companyNameTextSize === "Large" ? 40 : 33;
  const invoiceFontSize = invoiceTextSize === "Small" ? 15.5 : invoiceTextSize === "Large" ? 21 : 18;

  const themeBg = color || "#a855f7";
  const borderColor = resolveThemeColor(themeBg); // black when white is selected
  const col = `1px solid ${borderColor}`;

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
        <div style={{ background: "#fff", fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #e2e8f0", width: "210mm", minHeight: "297mm", boxSizing: "border-box", zoom: 0.55, overflow: "hidden" }}>

          {/* Solid color header banner */}
          <div style={{ background: themeBg, padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {showLogo ? (
              <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                {logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
              </div>
            ) : <div />}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: companyNameSize, fontWeight: 700, color: "#fff" }}>{showCompanyName ? companyName : ""}</div>
              {showPhone && <div style={{ fontSize: invoiceFontSize, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: 500 }}>Ph. no.: {phone}</div>}
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", padding: "10px 0", borderBottom: col }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: themeBg }}><EditableText textKey="title" defaultText="Sale" /></div>
          </div>

          {/* Bill To / Shipping To / Invoice Details */}
          <div style={{ padding: "0 30px" }}>
          <div style={{ display: "flex", borderBottom: col, fontSize: invoiceFontSize }}>
            <div style={{ flex: 1, borderRight: col }}>
              <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "5px 12px" }}><EditableText textKey="lbl_bill_to" defaultText="Bill To" /></div>
              <div style={{ padding: "8px 12px", color: TEXT_DARK }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{data.partyName}</div>
                {d.partyAddress && <div style={{ marginBottom: 2 }}>{d.partyAddress}</div>}
                {d.partyPhone && <div>Contact No.: {d.partyPhone}</div>}
              </div>
            </div>
            {shippingAddress && (
              <div style={{ flex: 1, borderRight: col }}>
                <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "5px 12px" }}><EditableText textKey="lbl_shipping_to" defaultText="Shipping To" /></div>
                <div style={{ padding: "8px 12px", color: TEXT_DARK }}>{shippingAddress}</div>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "5px 12px", textAlign: "right" }}><EditableText textKey="lbl_invoice_details" defaultText="Invoice Details" /></div>
              <div style={{ padding: "8px 12px", color: TEXT_DARK, textAlign: "right" }}>
                <div style={{ marginBottom: 2 }}>Invoice No.: {data.invoiceNo}</div>
                <div style={{ marginBottom: 2 }}>Date: {data.date}</div>
                {time && <div style={{ marginBottom: 2 }}>Time: {time}</div>}
                {dueDate && <div>Due Date: {dueDate}</div>}
              </div>
            </div>
          </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: "0 30px" }}>
          <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", borderLeft: col, borderRight: col }}>
            <thead>
              <tr style={{ background: themeBg, borderBottom: `2px solid ${borderColor}` }}>
                <th style={{ padding: "8px 8px", textAlign: "left", fontWeight: 700, color: "#fff", borderRight: col }}>#</th>
                <th style={{ padding: "8px 8px", textAlign: "left", fontWeight: 700, color: "#fff", borderRight: col }}>Item name</th>
                <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "#fff", borderRight: col }}>Quantity</th>
                <th style={{ padding: "8px 8px", textAlign: "right", fontWeight: 700, color: "#fff", borderRight: col }}>Price/unit</th>
                <th style={{ padding: "8px 8px", textAlign: "right", fontWeight: 700, color: "#fff", borderRight: col }}>Discount</th>
                <th style={{ padding: "8px 8px", textAlign: "right", fontWeight: 700, color: "#fff" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => {
                const it = item as any;
                return (
                  <tr key={item.id ?? idx} style={{ borderBottom: col }}>
                    <td style={{ padding: "8px 8px", color: TEXT_DARK, borderRight: col }}>{idx + 1}</td>
                    <td style={{ padding: "8px 8px", color: themeBg, fontWeight: 600, borderRight: col }}>{item.name}</td>
                    <td style={{ padding: "8px 8px", textAlign: "center", color: TEXT_DARK, borderRight: col }}>{item.quantity}{item.unit !== "NONE" ? ` ${item.unit}` : ""}</td>
                    <td style={{ padding: "8px 8px", textAlign: "right", color: TEXT_DARK, borderRight: col }}>Rs {item.price.toFixed(2)}</td>
                    <td style={{ padding: "8px 8px", textAlign: "right", color: TEXT_DARK, borderRight: col }}>
                      {it.discountAmount ? `Rs ${it.discountAmount.toFixed(2)}${it.discountPercent ? ` (${it.discountPercent}%)` : ""}` : "Rs 0.00"}
                    </td>
                    <td style={{ padding: "8px 8px", textAlign: "right", color: TEXT_DARK }}>Rs {item.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${borderColor}`, borderBottom: `2px solid ${borderColor}`, fontWeight: 700 }}>
                <td colSpan={2} style={{ padding: "8px 8px", color: TEXT_DARK, borderRight: col }}>Total</td>
                <td style={{ padding: "8px 8px", textAlign: "center", color: TEXT_DARK, borderRight: col }}>{data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</td>
                <td style={{ borderRight: col }} />
                <td style={{ padding: "8px 8px", textAlign: "right", color: TEXT_DARK, borderRight: col }}>Rs {(data.discountAmount ?? 0).toFixed(2)}</td>
                <td style={{ padding: "8px 8px", textAlign: "right", color: TEXT_DARK }}>Rs {data.subtotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          </div>

          {/* Tax Breakdown + Amounts */}
          <div style={{ display: "flex", gap: 16, padding: "16px 30px 0" }}>
            {taxBreakdown && taxBreakdown.length > 0 && (
              <table style={{ flex: 1, fontSize: invoiceFontSize, borderCollapse: "collapse", alignSelf: "flex-start", border: col }}>
                <thead>
                  <tr style={{ background: themeBg, borderBottom: `2px solid ${borderColor}` }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#fff", fontWeight: 700, borderRight: col }}>Tax type</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#fff", fontWeight: 700, borderRight: col }}>Taxable amount</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#fff", fontWeight: 700, borderRight: col }}>Rate</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#fff", fontWeight: 700 }}>Tax amount</th>
                  </tr>
                </thead>
                <tbody>
                  {taxBreakdown.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: col }}>
                      <td style={{ padding: "6px 8px", color: TEXT_DARK, borderRight: col }}>{row.type}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: TEXT_DARK, borderRight: col }}>Rs {row.taxableAmount.toFixed(2)}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: TEXT_DARK, borderRight: col }}>{row.rate}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: TEXT_DARK }}>Rs {row.taxAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ width: 260, fontSize: invoiceFontSize }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}><span>Sub Total</span><span>Rs {data.subtotal.toFixed(2)}</span></div>
              {data.discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}>
                  <span>Discount {data.discountPercent > 0 ? `(${data.discountPercent}%)` : ""}</span><span>Rs {data.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {data.taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}><span>{data.taxLabel || "Tax"}</span><span>Rs {data.taxAmount.toFixed(2)}</span></div>
              )}
              {data.roundOff && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}><span>Round off</span><span>Rs {data.roundOffAmount.toFixed(2)}</span></div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: 700, color: TEXT_DARK, borderTop: `2px solid ${themeBg}` }}><span>Total</span><span>Rs {data.grandTotal.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}><span>Received</span><span>Rs {data.received.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: TEXT_DARK }}><span>Balance</span><span>Rs {data.balance.toFixed(2)}</span></div>
              {typeof savedAmount === "number" && savedAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 2px", fontWeight: 700, color: TEXT_DARK }}><span>You Saved</span><span>Rs {savedAmount.toFixed(2)}</span></div>
              )}
            </div>
          </div>

          {/* Sections */}
          <div style={{ padding: "16px 30px 30px" }}>
            {/* Amount in Words */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "6px 10px", fontSize: invoiceFontSize }}><EditableText textKey="lbl_amount_words_no_colon" defaultText="Invoice Amount In Words" /></div>
              <div style={{ padding: "6px 10px", color: TEXT_DARK, fontSize: invoiceFontSize, border: col, borderTop: "none" }}>{numberToWords(data.grandTotal)} Rupees only</div>
            </div>
            {/* Description */}
            {data.description && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "6px 10px", fontSize: invoiceFontSize }}><EditableText textKey="lbl_desc_no_colon" defaultText="Description" /></div>
                <div style={{ padding: "6px 10px", color: TEXT_DARK, fontSize: invoiceFontSize, border: col, borderTop: "none" }}>{data.description}</div>
              </div>
            )}
            {/* Terms and Conditions */}
            {data.termsAndConditions && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "6px 10px", fontSize: invoiceFontSize }}><EditableText textKey="lbl_terms_upper" defaultText="Terms and conditions" /></div>
                <div style={{ padding: "6px 10px", color: TEXT_DARK, fontSize: invoiceFontSize, border: col, borderTop: "none" }}>{data.termsAndConditions}</div>
              </div>
            )}
            {/* Bank Details */}
            {bankDetails && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: themeBg, color: "#fff", fontWeight: 700, padding: "6px 10px", fontSize: invoiceFontSize }}><EditableText textKey="lbl_bank_details" defaultText="Bank Details" /></div>
                <div style={{ padding: "6px 10px", color: TEXT_DARK, fontSize: invoiceFontSize, border: col, borderTop: "none" }}>
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
    </div>
  );
}

