import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function TaxTheme1Preview({ color }: { color?: string }) {
  const th: React.CSSProperties = {
    padding: "4px 6px",
    textAlign: "left",
    fontWeight: 600,
    color: "#fff",
  };
  const td: React.CSSProperties = { padding: "4px 6px", color: TEXT_DARK, borderBottom: `1px solid ${BORDER}` };
  const purpleBg = color || "#9f8bc3";

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK }}>My Company</div>
          <div style={{ fontSize: 10, color: TEXT_MUTED }}>Ph. no.: 3369007084</div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            background: "#f3f4f6",
            border: `1px dashed ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: TEXT_MUTED,
          }}
        >
          Image
        </div>
      </div>
      
      <div style={{ borderBottom: `2px solid ${purpleBg}`, marginBottom: 6 }} />
      <div style={{ textAlign: "center", fontWeight: 600, color: purpleBg, fontSize: 16, marginBottom: 10 }}>
        Sale
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Bill To:</div>
          <div style={{ color: TEXT_DARK, fontWeight: 600 }}>Classic enterprises</div>
          <div style={{ color: TEXT_MUTED }}>Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</div>
          <div style={{ color: TEXT_MUTED }}>Contact No.: 8888888888</div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Shipping To:</div>
          <div style={{ color: TEXT_MUTED }}>Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Invoice Details</div>
          <div>Invoice No.: Inv. 101</div>
          <div>Date: 02-07-2019</div>
          <div>Time: 12:30 PM</div>
          <div>Due Date: 17-07-2019</div>
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", marginBottom: 10 }}>
        <thead>
          <tr style={{ background: purpleBg }}>
            {["#", "Item name", "HSC/SAC", "Quantity", "Price/unit", "Discount", "GST", "Amount"].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>1</td>
            <td style={td}>ITEM 1</td>
            <td style={td}>1234</td>
            <td style={td}>1+1</td>
            <td style={td}>Rs 10.00</td>
            <td style={td}>Rs 0.10 (1%)</td>
            <td style={td}>Rs 0.50 (5%)</td>
            <td style={td}>Rs 10.40</td>
          </tr>
          <tr>
            <td style={td}>2</td>
            <td style={td}>ITEM 2</td>
            <td style={td}>6325</td>
            <td style={td}>1</td>
            <td style={td}>Rs 30.00</td>
            <td style={td}>Rs 0.00 (0%)</td>
            <td style={td}>Rs 5.40 (18%)</td>
            <td style={td}>Rs 35.40</td>
          </tr>
          <tr style={{ fontWeight: 600 }}>
            <td style={td} colSpan={3}>Total</td>
            <td style={td}>2 + 1</td>
            <td style={td} />
            <td style={td}>Rs 0.10</td>
            <td style={td}>Rs 5.90</td>
            <td style={td}>Rs 45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Description</div>
          <div style={{ color: TEXT_MUTED, marginBottom: 10 }}>Sale Description</div>
          
          <div style={{ fontWeight: 600, marginBottom: 2 }}>INVOICE AMOUNT IN WORDS</div>
          <div style={{ color: TEXT_MUTED, marginBottom: 10 }}>Forty Two Rupees and Thirty Two Paisa only</div>
          
          <div style={{ marginBottom: 10 }}>Due Date: 17-07-2019</div>
          
          <div style={{ fontWeight: 600, marginBottom: 2 }}>TERMS AND CONDITIONS</div>
          <div style={{ color: TEXT_MUTED }}>Thanks for doing business with us!</div>
        </div>
        <div style={{ width: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Sub Total</span><span>Rs 40.00</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount</span><span>Rs 0.10</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>SGST@2.5%</span><span>Rs 0.25</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>CGST@2.5%</span><span>Rs 0.25</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>SGST@9%</span><span>Rs 2.70</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>CGST@9%</span><span>Rs 2.70</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Discount (12%)</span><span>Rs 5.50</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>SGST@2.5%</span><span>Rs 1.01</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>CGST@2.5%</span><span>Rs 1.01</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", background: purpleBg, color: "#fff", padding: "2px 4px", fontWeight: 600, marginBottom: 2 }}><span>Total</span><span>Rs 42.32</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Received</span><span>Rs 12.00</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Balance</span><span>Rs 30.32</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginTop: 4 }}><span>You Saved</span><span>Rs 42.32</span></div>
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", borderTop: `1px solid ${BORDER}` }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px 0", width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Pay To:</div>
              <div style={{ color: TEXT_MUTED }}>Bank Name: 123123123123</div>
              <div style={{ color: TEXT_MUTED }}>Bank Account No.: 12312312312</div>
              <div style={{ color: TEXT_MUTED }}>Bank IFSC code: 123123123</div>
              <div style={{ color: TEXT_MUTED }}>IBAN: AE12 3456 7890 1234 5678 901</div>
            </td>
            <td style={{ padding: "8px 0", verticalAlign: "top", textAlign: "right" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>For: My Company</div>
              <div
                style={{
                  width: 60,
                  height: 30,
                  background: "#f3f4f6",
                  borderRadius: 4,
                  display: "inline-block",
                  marginBottom: 6,
                }}
              />
              <div style={{ color: TEXT_MUTED }}>Authorized Signatory</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
