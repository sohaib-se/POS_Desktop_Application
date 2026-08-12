import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function Theme2Preview({ color }: { color?: string }) {
  const themeBg = color || "#a855f7"; // Purple
  const th: React.CSSProperties = { padding: "4px 6px", textAlign: "left", fontWeight: 600, color: "#fff" };
  const td: React.CSSProperties = { padding: "4px 6px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif", border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ width: 60, height: 60, background: "#f3f4f6", border: `1px dashed ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: TEXT_MUTED }}>Image</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK }}>My Company</div>
          <div style={{ fontSize: 10, color: TEXT_MUTED }}>Ph. no.: 3369007084</div>
        </div>
      </div>
      
      <div style={{ background: themeBg, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: 16, padding: "6px 0", marginBottom: 10 }}>Sale</div>
      
      <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <tbody>
          <tr style={{ background: themeBg, color: "#fff", fontWeight: 600 }}>
            <td style={{ padding: "4px 6px", borderRight: `1px solid #fff`, width: "33%" }}>Bill To:</td>
            <td style={{ padding: "4px 6px", borderRight: `1px solid #fff`, width: "33%" }}>Shipping To</td>
            <td style={{ padding: "4px 6px", textAlign: "right" }}>Invoice Details</td>
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
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Invoice No.:</span><span>Inv. 101</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Date:</span><span>02-07-2019</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Time:</span><span>12:30 PM</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Due Date:</span><span>17-07-2019</span></div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <thead>
          <tr style={{ background: themeBg, borderBottom: `1px solid ${BORDER}` }}>
            {["#", "Item name", "HSC/SAC", "Quantity", "Price/unit", "Discount", "GST", "Amount"].map((h) => (
              <th key={h} style={{ ...th, borderRight: `1px solid #fff` }}>{h}</th>
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
            <td style={td} colSpan={3}>Total</td><td style={td}>2 + 1</td><td style={td} /><td style={td}>Rs 0.10</td><td style={td}>Rs 5.90</td><td style={{ ...td, borderRight: "none" }}>Rs 45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", fontSize: 9.5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <table style={{ flex: 1, borderCollapse: "collapse", borderRight: `1px solid ${BORDER}` }}>
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
        
        <div style={{ width: 180 }}>
          <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Amounts</div>
          <div style={{ padding: "4px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Sub Total</span><span>Rs 45.80</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount (12%)</span><span>Rs 5.50</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Tax (5%)</span><span>Rs 2.02</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, paddingTop: 2, marginBottom: 2 }}><span>Total</span><span>Rs 42.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Received</span><span>Rs 12.000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Balance</span><span>Rs 30.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>You Saved</span><span>Rs 30.32</span></div>
          </div>
        </div>
      </div>
      
      <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Invoice Amount In Words</div>
      <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", color: TEXT_MUTED, padding: "4px 6px", marginBottom: 10, fontSize: 9.5 }}>Forty Two Rupees and Thirty Two Paisa only</div>

      <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Description</div>
      <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", color: TEXT_MUTED, padding: "4px 6px", marginBottom: 10, fontSize: 9.5 }}>Sale Description</div>
      
      <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Terms and conditions</div>
      <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", color: TEXT_MUTED, padding: "4px 6px", marginBottom: 10, fontSize: 9.5 }}>Thanks for doing business with us!</div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5 }}>
        <div style={{ flex: 1, marginRight: 20 }}>
          <div style={{ background: themeBg, color: "#fff", fontWeight: 600, padding: "4px 6px" }}>Bank Details</div>
          <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", padding: "8px", color: TEXT_MUTED }}>
            <div>Bank Name: 123123123123</div>
            <div>Bank Account No.: 12312312312</div>
            <div>Bank IFSC code: 123123123</div>
            <div>IBAN: AE12 3456 7890 1234 5678 901</div>
          </div>
        </div>
        <div style={{ width: 150, textAlign: "center", paddingTop: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>For: My Company</div>
          <div style={{ width: 60, height: 30, background: "#f3f4f6", borderRadius: 4, display: "inline-block", marginBottom: 6 }} />
          <div style={{ color: TEXT_MUTED }}>Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}
