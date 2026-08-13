import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function FrenchElitePreview({ color }: { color?: string }) {
  const { companyName, phone, email, logo, showCompanyName, showPhone, showEmail, showLogo , companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const purpleBg = color || "#8b5cf6";
  const lightPurpleBg = color ? (color + "1a") : "#ede9fe";
  const th: React.CSSProperties = { padding: "6px 8px", textAlign: "left", fontWeight: 600, color: "#fff", fontSize: invoiceFontSize };
  const td: React.CSSProperties = { padding: "6px 8px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, fontSize: invoiceFontSize };

  return (
    <div style={{ background: "#fff", padding: 20, fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #000" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ background: purpleBg, color: "#fff", fontSize: 24, fontWeight: 700, padding: "10px 40px", display: "inline-block", marginBottom: 20 }}>
            TAX INVOICE
          </div>
          {showCompanyName && ( <div style={{ fontSize: companyNameSize, fontWeight: 700, color: purpleBg, marginBottom: 6 }}>{showCompanyName ? companyName : ""}</div> )}
          {showPhone && ( <>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>Phone:</div>
            {showPhone && (<div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 4 }}>{showPhone ? phone : ""}</div>)}
          </> )}
          {showEmail && ( <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>Email: {email}</div> )}
        </div>
        {showLogo && (
          <div style={{ width: 100, height: 100, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: invoiceFontSize, color: TEXT_MUTED, overflow: "hidden" }}>
{logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}><EditableText textKey="lbl_inv_no" defaultText="Invoice No.:" /> #1</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Invoice <EditableText textKey="lbl_date" defaultText="Date:" /></span><span>29/05/2020</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Invoice <EditableText textKey="lbl_time" defaultText="Time:" /></span><span>12:30 PM</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Place of Supply:</span><span>29-Karnataka</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>PO date:</span><span>29/05/2020</span></div>
        </div>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}><EditableText textKey="lbl_bill_to" defaultText="Bill To:" /></div>
          <div style={{ fontWeight: 600, fontSize: invoiceFontSize, marginBottom: 4 }}>Classic Enterprises Pvt Ltd.</div>
          <div style={{ color: TEXT_MUTED, fontSize: invoiceFontSize, marginBottom: 4 }}>Mehta Textiles, Marathalli Road, Bangalore, Karnataka, 560034</div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Contact No.:</span><span>1237894560</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>GSTIN Number:</span><span>28VGVGV7878V1Z5</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>State:</span><span>29-Karnataka</span></div>
        </div>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}>Transportation Details:</div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Transport Name:</span><span>ARYION interstate Transport service</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Vehicle Number:</span><span>KA 8A8A 7878</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: invoiceFontSize, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Delivery <EditableText textKey="lbl_date" defaultText="Date:" /></span><span>05 - Jun - 2020</span></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
        <thead>
          <tr style={{ background: purpleBg }}>
            {["#", <EditableText textKey="th_item_name" defaultText="Item name" />, "HSN / SAC", <EditableText textKey="th_qty" defaultText="Quantity" />, <EditableText textKey="th_price" defaultText="Price/unit" />, <EditableText textKey="th_discount" defaultText="Discount" />, <EditableText textKey="th_tax" defaultText="GST" />, <EditableText textKey="th_amount" defaultText="Amount" />].map((h, i) => (
              <th key={i} style={{ ...th, borderRight: `1px solid #fff` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>1</td><td style={td}>Crompton Rigged Ceiling Fan - Blue</td><td style={td}>1452</td><td style={td}>2</td><td style={td}>Rs 1,568.00</td><td style={td}>Rs 62.72 (2%)</td><td style={td}>Rs 153.66 (5%)</td><td style={{ ...td, borderRight: "none" }}>Rs 3,275.94</td>
          </tr>
          <tr>
            <td style={td}>2</td><td style={td}>Panasonic 10W LED Bulb</td><td style={td}>8475</td><td style={td}>5 + 1</td><td style={td}>Rs 123.00</td><td style={td}>Rs 0.00 (0%)</td><td style={td}>Rs 18.45 (3%)</td><td style={{ ...td, borderRight: "none" }}>Rs 645.95</td>
          </tr>
          <tr>
            <td style={td}>3</td><td style={td}>Sony BRAVIA 32 inch Android Smart Tv</td><td style={td}>4528</td><td style={td}>1</td><td style={td}>Rs 45,000.00</td><td style={td}>Rs 2,250.00 (5%)</td><td style={td}>Rs 5,130.00 (12%)</td><td style={{ ...td, borderRight: "none" }}>Rs 47,880.00</td>
          </tr>
          <tr>
            <td style={td}>4</td><td style={td}>Sony BRAVIA 32 inch Android Smart Tv</td><td style={td}>4528</td><td style={td}>1</td><td style={td}>Rs 45,000.00</td><td style={td}>Rs 0.00 (0%)</td><td style={td}>Rs 5,400.00 (12%)</td><td style={{ ...td, borderRight: "none" }}>Rs 50,400.00</td>
          </tr>
          <tr style={{ fontWeight: 700, background: purpleBg, color: "#fff" }}>
            <td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: invoiceFontSize }} colSpan={3}><EditableText textKey="lbl_total" defaultText="Total" /></td>
            <td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: invoiceFontSize }}>9 + 1</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: invoiceFontSize }} /><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: invoiceFontSize }}>Rs 2,312.72</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: invoiceFontSize }}>Rs 10,702.11</td><td style={{ padding: "6px 8px", fontSize: invoiceFontSize }}>Rs 1,02,201.89</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}><EditableText textKey="lbl_pay_to" defaultText="Pay To:" /></div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 4 }}>Bank Name: ICICI BANK, Branch - HSR LAYOUT</div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 4 }}>Bank Account No.: 1234567890</div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 4 }}>Bank SWIFT code: IFSC000123</div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 12 }}>IBAN: AE12 3456 7890 1234 5678 901</div>

          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}><EditableText textKey="lbl_amount_words_no_colon" defaultText="Invoice Amount In Words" /></div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 12 }}>One Lakh Two Thousand Four Hundred Fifty Two Rupees only</div>

          <div style={{ fontSize: companyNameSize, color: purpleBg, marginBottom: 8 }}><EditableText textKey="lbl_terms_no_colon" defaultText="Terms And Conditions" /></div>
          <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 20 }}>Thanks for doing business with us!</div>

          <div style={{ fontSize: invoiceFontSize, color: TEXT_DARK, marginBottom: 6 }}><EditableText textKey="lbl_for" defaultText="For:" /> {showCompanyName ? companyName : ""}</div>
          {showLogo && (
          <div style={{ width: 100, height: 100, background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 6, fontSize: invoiceFontSize, color: TEXT_MUTED, overflow: "hidden" }}>
{logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
)}
          <div style={{ fontSize: 12, color: TEXT_DARK, fontWeight: 700 }}><EditableText textKey="lbl_auth_sig" defaultText="Authorized Signatory" /></div>
        </div>
        
        <div style={{ width: 220, fontSize: invoiceFontSize }}>
          <div style={{ border: `1px solid ${BORDER}`, borderBottom: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span><EditableText textKey="lbl_sub_total" defaultText="Sub Total" /></span><span>Rs 93,751.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Discount</span><span>Rs 2,312.72</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@3%</span><span>Rs 18.45</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@5%</span><span>Rs 153.66</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@12%</span><span>Rs 10,530.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Ad. CESS</span><span>Rs 61.50</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Shipping</span><span>Rs 250.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Round off</span><span>Rs 0.11</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: purpleBg, color: "#fff", fontWeight: 700 }}><span><EditableText textKey="lbl_total" defaultText="Total" /></span><span>Rs 1,02,452.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span><span>Rs 50,000.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span><span>Rs 52,452.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: lightPurpleBg, color: purpleBg, fontWeight: 700 }}><span><EditableText textKey="lbl_saved_no_colon" defaultText="You Saved" /></span><span>Rs 32.32</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
