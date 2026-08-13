import { EditableText } from "./SharedComponents";
import { useCompanyDetails } from "./useCompanyDetails";
import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function TaxTheme2Preview({ color }: { color?: string }) {
  const { companyName, phone, logo, showCompanyName, showPhone, showLogo , companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const th: React.CSSProperties = { padding: "4px 6px", textAlign: "left", fontWeight: 600, color: "#fff" };
  const td: React.CSSProperties = { padding: "4px 6px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };
  const themeBg = color || "#f59e0b"; // Orange

  return (
    <div style={{ background: "#fff", padding: 20, fontFamily: "Inter, system-ui, sans-serif", border: "1px solid #000" }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: companyNameSize, marginBottom: 10 }}><EditableText textKey="title" defaultText="Sale" /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        {showLogo && (
<div style={{ width: 100, height: 100, background: "transparent",  display: "flex", alignItems: "center", justifyContent: "center", fontSize: invoiceFontSize, color: TEXT_MUTED , overflow: "hidden" }}>
{logo ? <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
</div>
)}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK }}>{showCompanyName ? companyName : ""}</div>
          {showPhone && (<div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>Ph. no.: {showPhone ? phone : ""}</div>)}
        </div>
      </div>
      
      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 0 }}>
        <tbody>
          <tr style={{ background: themeBg, color: "#fff", fontWeight: 600 }}>
            <td style={{ padding: "4px 6px", borderRight: `1px solid #fff`, width: "33%" }}><EditableText textKey="lbl_bill_to" defaultText="Bill To:" /></td>
            <td style={{ padding: "4px 6px", borderRight: `1px solid #fff`, width: "33%" }}>Shipping To</td>
            <td style={{ padding: "4px 6px", textAlign: "left" }}><EditableText textKey="lbl_inv_details_no_colon" defaultText="Invoice Details" /></td>
          </tr>
          <tr>
            <td style={{ padding: "4px 6px", borderRight: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ color: TEXT_DARK, fontWeight: 600 }}>Classic enterprises</div>
              <div style={{ color: TEXT_MUTED }}>Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</div>
              <div style={{ color: TEXT_MUTED }}>Contact No.: 8888888888</div>
            </td>
            <td style={{ padding: "4px 6px", borderRight: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ color: TEXT_MUTED }}>Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</div>
            </td>
            <td style={{ padding: "4px 6px", verticalAlign: "top" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Invoice No.</span><span>Inv. 101</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Date</span><span>02-07-2019</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Time</span><span>12:30 PM</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Due Date</span><span>17-07-2019</span></div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, borderTop: "none" }}>
        <thead>
          <tr style={{ background: themeBg, borderBottom: `1px solid ${BORDER}` }}>
            {["#", <EditableText textKey="th_item_name" defaultText="Item name" />, <EditableText textKey="th_hsn" defaultText="HSC/SAC" />, <EditableText textKey="th_qty" defaultText="Quantity" />, <EditableText textKey="th_price" defaultText="Price/unit" />, <EditableText textKey="th_discount" defaultText="Discount" />, <EditableText textKey="th_tax" defaultText="GST" />, <EditableText textKey="th_amount" defaultText="Amount" />].map((h, i) => (
              <th key={i} style={{ ...th, borderRight: `1px solid #fff` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>1</td><td style={td}>ITEM 1</td><td style={td}>1234</td><td style={td}>1+1</td><td style={td}>Rs 10.00</td><td style={td}>Rs 0.10 (1%)</td><td style={td}>Rs 0.50 (5%)</td><td style={{ ...td, borderRight: "none" }}>Rs 10.40</td>
          </tr>
          <tr>
            <td style={td}>2</td><td style={td}>ITEM 2</td><td style={td}>6325</td><td style={td}>1</td><td style={td}>Rs 30.00</td><td style={td}>Rs 0.00 (0%)</td><td style={td}>Rs 5.40 (18%)</td><td style={{ ...td, borderRight: "none" }}>Rs 35.40</td>
          </tr>
          <tr style={{ fontWeight: 600 }}>
            <td style={td} colSpan={3}><EditableText textKey="lbl_total" defaultText="Total" /></td><td style={td}>2 + 1</td><td style={td} /><td style={td}>Rs 0.10</td><td style={td}>Rs 5.90</td><td style={{ ...td, borderRight: "none" }}>Rs 45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", fontSize: invoiceFontSize, border: `1px solid ${BORDER}`, borderTop: "none", marginBottom: 10 }}>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}` }}>
          <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px", textAlign: "center" }}>Invoice Amount In Words</div>
          <div style={{ color: TEXT_MUTED, padding: "8px", textAlign: "center" }}>Forty Two Rupees and Thirty Two Paisa only</div>
        </div>
        <div style={{ width: 180 }}>
          <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Amounts</div>
          <div style={{ padding: "4px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_sub_total" defaultText="Sub Total" /></span><span>Rs 45.80</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount (12%)</span><span>Rs 5.50</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Tax (5%)</span><span>Rs 2.02</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, paddingTop: 2, marginBottom: 2 }}><span><EditableText textKey="lbl_total" defaultText="Total" /></span><span>Rs 42.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_received_no_colon" defaultText="Received" /></span><span>Rs 12.000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span><EditableText textKey="lbl_balance_no_colon" defaultText="Balance" /></span><span>Rs 30.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span><EditableText textKey="lbl_saved_no_colon" defaultText="You Saved" /></span><span>Rs 30.32</span></div>
          </div>
        </div>
      </div>
      
      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <thead>
          <tr style={{ background: themeBg, color: "#fff" }}>
            <th style={{ padding: "4px", borderRight: `1px solid #fff`, textAlign: "left" }}>Tax type</th>
            <th style={{ padding: "4px", borderRight: `1px solid #fff`, textAlign: "left" }}>Taxable amount</th>
            <th style={{ padding: "4px", borderRight: `1px solid #fff`, textAlign: "left" }}>Rate</th>
            <th style={{ padding: "4px", textAlign: "left" }}>Tax amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>SGST</td>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs 50.20</td>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>2.5%</td>
            <td style={{ padding: "2px 4px" }}>Rs 1.26</td>
          </tr>
          <tr>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>CGST</td>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>Rs 50.20</td>
            <td style={{ padding: "2px 4px", borderRight: `1px solid ${BORDER}` }}>2.5%</td>
            <td style={{ padding: "2px 4px" }}>Rs 1.26</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}` }}>
        <thead>
          <tr style={{ background: themeBg, color: "#fff" }}>
            <th style={{ padding: "4px 6px", borderRight: `1px solid #fff`, textAlign: "left", width: "50%" }}>Bank Details</th>
            <th style={{ padding: "4px 6px", textAlign: "left", width: "50%" }}>Terms and conditions:</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "8px", borderRight: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ color: TEXT_MUTED }}>Bank Name: 123123123123</div>
              <div style={{ color: TEXT_MUTED }}>Bank Account No.: 12312312312</div>
              <div style={{ color: TEXT_MUTED }}>Bank IFSC code: 123123123</div>
              <div style={{ color: TEXT_MUTED }}>IBAN: AE12 3456 7890 1234 5678 901</div>
            </td>
            <td style={{ padding: "8px", verticalAlign: "top" }}>
              <div style={{ color: TEXT_MUTED, marginBottom: 10 }}>Thanks for doing business with us!</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, marginBottom: 6, textAlign: "right" }}><EditableText textKey="lbl_for" defaultText="For:" /> {showCompanyName ? companyName : ""}</div>
                <div style={{ width: 60, height: 30, background: "#f3f4f6", display: "inline-block", marginBottom: 6 }} />
                <div style={{ color: TEXT_MUTED }}><EditableText textKey="lbl_auth_sig" defaultText="Authorized Signatory" /></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
