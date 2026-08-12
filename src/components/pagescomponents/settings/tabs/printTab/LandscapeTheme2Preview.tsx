import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function LandscapeTheme2Preview(_props: { color?: string }) {
  const th: React.CSSProperties = { padding: "4px 6px", textAlign: "left", fontWeight: 600, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };
  const td: React.CSSProperties = { padding: "4px 6px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif", border: `1px solid ${BORDER}` }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 16, marginBottom: 10, borderBottom: `1px solid ${BORDER}`, paddingBottom: 6 }}>Tax Invoice</div>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 60, height: 60, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: TEXT_MUTED }}>Image</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK }}>My Company</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>Phone: 3369007084</div>
          </div>
        </div>
        <div style={{ fontSize: 9.5, textAlign: "right" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: 140 }}><span>Invoice No.:</span><span>Inv. 101</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", width: 140 }}><span>Date:</span><span>02-07-2019</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", width: 140 }}><span>Time:</span><span>12:30 PM</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", width: 140 }}><span>Due Date:</span><span>17-07-2019</span></div>
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 0 }}>
        <tbody>
          <tr style={{ fontWeight: 600 }}>
            <td style={{ padding: "4px 6px", borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, width: "50%" }}>Bill To:</td>
            <td style={{ padding: "4px 6px", borderBottom: `1px solid ${BORDER}`, width: "50%" }}>Ship To:</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 6px", borderRight: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ color: TEXT_DARK, fontWeight: 600 }}>Classic enterprises</div>
              <div style={{ color: TEXT_MUTED }}>Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</div>
              <div style={{ color: TEXT_MUTED }}>Contact No.: 8888888888</div>
            </td>
            <td style={{ padding: "4px 6px", verticalAlign: "top" }}>
              <div style={{ color: TEXT_MUTED }}>Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: `1px solid ${BORDER}`, borderTop: "none" }}>
        <thead>
          <tr>
            {["#", "Item name", "HSC/SAC", "Quantity", "Price/unit", "Discount", "GST", "Amount"].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>1</td><td style={td}>ITEM 1</td><td style={td}>1234</td><td style={td}>1+1</td><td style={td}>10.00</td><td style={td}>0.10 (1%)</td><td style={td}>0.50 (5%)</td><td style={td}>10.40</td>
          </tr>
          <tr>
            <td style={td}>2</td><td style={td}>ITEM 2</td><td style={td}>6325</td><td style={td}>1</td><td style={td}>30.00</td><td style={td}>0.00 (0%)</td><td style={td}>5.40 (18%)</td><td style={td}>35.40</td>
          </tr>
          <tr style={{ fontWeight: 600 }}>
            <td style={td} colSpan={3}>TOTAL</td><td style={td}>2 + 1</td><td style={td} /><td style={td}>0.10</td><td style={td}>5.90</td><td style={td}>45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", fontSize: 9.5, border: `1px solid ${BORDER}`, borderTop: "none", marginBottom: 10 }}>
        <table style={{ flex: 1, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th rowSpan={2} style={th}>HSN/ SAC</th>
              <th rowSpan={2} style={th}>Taxable amount(Rs)</th>
              <th colSpan={2} style={th}>CGST</th>
              <th colSpan={2} style={th}>SGST</th>
              <th rowSpan={2} style={th}>Total Tax Amount(Rs)</th>
            </tr>
            <tr>
              <th style={th}>Rate(%)</th>
              <th style={th}>Amount(Rs)</th>
              <th style={th}>Rate(%)</th>
              <th style={th}>Amount(Rs)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}></td><td style={td}>50.20</td><td style={td}>2.5%</td><td style={td}>1.26</td><td style={td}>2.5%</td><td style={td}>1.26</td><td style={td}>680,002.52</td>
            </tr>
            <tr>
              <td style={td}></td><td style={td}>30.00</td><td style={td}>9.0%</td><td style={td}>2.70</td><td style={td}>9.0%</td><td style={td}>2.70</td><td style={td}>5.40</td>
            </tr>
            <tr style={{ fontWeight: 600 }}>
              <td style={{ ...td, textAlign: "right" }} colSpan={2}>TOTAL</td><td style={td}>80.20</td><td style={td} /><td style={td}>3.96</td><td style={td} /><td style={td}>3.96</td><td style={td}>9.92</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ width: 180, borderLeft: `1px solid ${BORDER}` }}>
          <div style={{ padding: "4px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Sub Total</span><span>Rs 45.80</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount (12%)</span><span>Rs 5.50</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Tax (5%)</span><span>Rs 2.02</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, paddingTop: 2, marginBottom: 2 }}><span>Total</span><span>Rs 42.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Received</span><span>Rs 12.000</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Balance</span><span>Rs 30.32</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>You Saved</span><span>Rs 111.00</span></div>
          </div>
        </div>
      </div>
      
      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 0 }}>
        <tbody>
          <tr>
            <td style={{ padding: "4px 6px", borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Description:</div>
              <div style={{ color: TEXT_MUTED }}>Sale Description</div>
            </td>
            <td style={{ padding: "4px 6px", borderBottom: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Terms & Conditions:</div>
              <div style={{ color: TEXT_MUTED }}>Thanks for doing business with us!</div>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px", borderRight: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Bank Details:</div>
              <div style={{ color: TEXT_MUTED }}>Bank Name: 123123123123</div>
              <div style={{ color: TEXT_MUTED }}>Bank Account No.: 12312312312</div>
              <div style={{ color: TEXT_MUTED }}>Bank IFSC code: 123123123</div>
              <div style={{ color: TEXT_MUTED }}>IBAN: AE12 3456 7890 1234 5678 901</div>
            </td>
            <td style={{ padding: "8px", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>For: My Company</div>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <div style={{ width: 60, height: 30, background: "#f3f4f6", borderRadius: 4, display: "inline-block", marginBottom: 6 }} />
                <div style={{ color: TEXT_MUTED }}>Authorized Signatory</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
