import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function DoubleDivinePreview({ color }: { color?: string }) {
  const { companyName, phone, logo, showCompanyName, showPhone, showLogo , companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const redBg = color || "#e31837";
  const darkBg = "#262626";
  const th: React.CSSProperties = { padding: "6px 8px", textAlign: "left", fontWeight: 600, color: "#fff" };
  const td: React.CSSProperties = { padding: "6px 8px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };

  return (
    <div style={{ background: "#fff", padding: "0 0 20px 0", fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #000", overflow: "hidden" }}>
      
      {/* Header section with curves */}
      <div style={{ display: "flex", height: 100, marginBottom: 10 }}>
        <div style={{ flex: 1, background: darkBg, position: "relative", display: "flex", alignItems: "center", paddingLeft: 20 }}>
          {showLogo && (
<div style={{ width: 100, height: 100, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: invoiceFontSize, color: "#a1a1aa" , overflow: "hidden" }}>
{logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
</div>
)}
          <div style={{ position: "absolute", right: -30, top: 0, bottom: 0, width: 60, background: darkBg, borderRadius: "50%", zIndex: 1 }} />
        </div>
        <div style={{ flex: 1.5, background: redBg, position: "relative", display: "flex", alignItems: "center", paddingLeft: 40, color: "#fff", fontWeight: 600 }}>
          <div style={{ zIndex: 2 }}>📞 {showPhone ? phone : ""}</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK, marginBottom: 10 }}>{showCompanyName ? companyName : ""}</div>
            <div style={{ fontWeight: 700, color: redBg, marginBottom: 4, fontSize: companyNameSize }}><EditableText textKey="lbl_bill_to" defaultText="Bill To:" /></div>
            <div style={{ color: TEXT_DARK, fontWeight: 600, fontSize: invoiceFontSize }}>Classic Enterprises Pvt Ltd.</div>
            <div style={{ color: TEXT_MUTED, fontSize: invoiceFontSize }}>Mehta Textiles, Marathalli Road, Bangalore, Karnataka, 560034</div>
            <div style={{ color: TEXT_MUTED, fontSize: invoiceFontSize }}>Contact No: 1237894560</div>
            <div style={{ color: TEXT_MUTED, fontSize: invoiceFontSize }}>GSTIN Number: 28VGVGV7878V1Z5</div>
            <div style={{ color: TEXT_MUTED, fontSize: invoiceFontSize }}>State: 29-Karnataka</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: redBg, marginBottom: 4, fontSize: companyNameSize }}>Transportation Details:</div>
            <div style={{ display: "flex", gap: 20, fontSize: invoiceFontSize, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, width: 80 }}>Transport Name:</span>
              <span style={{ color: TEXT_MUTED }}>ARYION interstate Transport service</span>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: invoiceFontSize, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, width: 80 }}>Vehicle Number:</span>
              <span style={{ color: TEXT_MUTED }}>KA 8A8A 7878</span>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: invoiceFontSize, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, width: 80 }}>Delivery <EditableText textKey="lbl_date" defaultText="Date:" /></span>
              <span style={{ color: TEXT_MUTED }}>05 - Jun - 2020</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 300, color: TEXT_DARK, marginBottom: 10 }}><EditableText textKey="title" defaultText="Tax Invoice" /></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, width: 140, marginLeft: "auto", marginBottom: 2 }}><span><EditableText textKey="lbl_inv_no" defaultText="Invoice No.:" /></span><span>#1</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, width: 140, marginLeft: "auto", marginBottom: 2 }}><span>Invoice <EditableText textKey="lbl_date" defaultText="Date:" /></span><span>29/05/2020</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, width: 140, marginLeft: "auto", marginBottom: 2 }}><span>Invoice <EditableText textKey="lbl_time" defaultText="Time:" /></span><span>12:30 PM</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, width: 140, marginLeft: "auto", marginBottom: 2 }}><span>Place of Supply:</span><span>29-Karnataka</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: invoiceFontSize, width: 140, marginLeft: "auto", marginBottom: 2 }}><span>PO date:</span><span>29/05/2020</span></div>
          </div>
        </div>

        <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
          <thead>
            <tr style={{ background: redBg }}>
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
            <tr style={{ fontWeight: 700, background: redBg, color: "#fff" }}>
              <td style={{ padding: "6px 8px", borderRight: `1px solid #fff` }} colSpan={3}><EditableText textKey="lbl_total" defaultText="Total" /></td>
              <td style={{ padding: "6px 8px", borderRight: `1px solid #fff` }}>9 + 1</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff` }} /><td style={{ padding: "6px 8px", borderRight: `1px solid #fff` }}>Rs 2,312.72</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff` }}>Rs 10,702.11</td><td style={{ padding: "6px 8px" }}>Rs 1,02,201.89</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: redBg, marginBottom: 4, fontSize: companyNameSize }}><EditableText textKey="lbl_pay_to" defaultText="Pay To:" /></div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 2 }}>Bank Name: ICICI BANK, Branch - HSR LAYOUT</div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 2 }}>Bank Account No.: 1234567890</div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 2 }}>Bank SWIFT code: IFSC000123</div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 12 }}>IBAN: AE12 3456 7890 1234 5678 901</div>

            <div style={{ fontWeight: 700, color: redBg, marginBottom: 4, fontSize: companyNameSize }}>Invoice Amount In Words</div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 12 }}>One Lakh Two Thousand Four Hundred Fifty Two Rupees only</div>

            <div style={{ fontWeight: 700, color: redBg, marginBottom: 4, fontSize: companyNameSize }}>Terms And Conditions</div>
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED, marginBottom: 16 }}>Thanks for doing business with us!</div>

            <div style={{ fontSize: invoiceFontSize, color: TEXT_DARK, marginBottom: 6 }}><EditableText textKey="lbl_for" defaultText="For:" /> {showCompanyName ? companyName : ""}</div>
            <div style={{ width: 60, height: 40, background: "#f3f4f6", display: "inline-block", marginBottom: 6 }} />
            <div style={{ fontSize: invoiceFontSize, color: TEXT_DARK, fontWeight: 600 }}><EditableText textKey="lbl_auth_sig" defaultText="Authorized Signatory" /></div>
          </div>
          
          <div style={{ width: 220, fontSize: invoiceFontSize }}>
            <div style={{ border: `1px solid ${BORDER}`, borderBottom: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Sub total</span><span>Rs 93,751.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Discount</span><span>Rs 2,312.72</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@3%</span><span>Rs 18.45</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@5%</span><span>Rs 153.66</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@12%</span><span>Rs 10,530.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Ad. CESS</span><span>Rs 61.50</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Shipping</span><span>Rs 250.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Round off</span><span>Rs 0.11</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: redBg, color: "#fff", fontWeight: 700 }}><span><EditableText textKey="lbl_total" defaultText="Total" /></span><span>Rs 1,02,452.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span><span>Rs 50,000.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span><span>Rs 52,452.00</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: redBg, color: "#fff", fontWeight: 700 }}><span><EditableText textKey="lbl_saved_no_colon" defaultText="You Saved" /></span><span>Rs 30.32.00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
