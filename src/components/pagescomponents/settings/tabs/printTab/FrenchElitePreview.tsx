import { BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function FrenchElitePreview({ color }: { color?: string }) {
  const purpleBg = color || "#8b5cf6";
  const lightPurpleBg = color ? (color + "1a") : "#ede9fe";
  const th: React.CSSProperties = { padding: "6px 8px", textAlign: "left", fontWeight: 600, color: "#fff", fontSize: 9.5 };
  const td: React.CSSProperties = { padding: "6px 8px", color: TEXT_DARK, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, fontSize: 9.5 };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif", border: `1px solid ${BORDER}` }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ background: purpleBg, color: "#fff", fontSize: 24, fontWeight: 700, padding: "10px 40px", display: "inline-block", marginBottom: 20 }}>
            TAX INVOICE
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: purpleBg, marginBottom: 6 }}>My Company</div>
          <div style={{ fontSize: 10, color: TEXT_MUTED }}>Phone:</div>
          <div style={{ fontSize: 10, color: TEXT_MUTED, marginBottom: 4 }}>3369007084</div>
          <div style={{ fontSize: 10, color: TEXT_MUTED }}>Email:</div>
        </div>
        <div style={{ width: 80, height: 80, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: TEXT_MUTED }}>Image</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Invoice No.: #1</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Invoice Date:</span><span>29/05/2020</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Invoice Time:</span><span>12:30 PM</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Place of Supply:</span><span>29-Karnataka</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>PO date:</span><span>29/05/2020</span></div>
        </div>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Bill To:</div>
          <div style={{ fontWeight: 600, fontSize: 10, marginBottom: 4 }}>Classic Enterprises Pvt Ltd.</div>
          <div style={{ color: TEXT_MUTED, fontSize: 9.5, marginBottom: 4 }}>Mehta Textiles, Marathalli Road, Bangalore, Karnataka, 560034</div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>Contact No.:</span><span>1237894560</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>GSTIN Number:</span><span>28VGVGV7878V1Z5</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED }}>State:</span><span>29-Karnataka</span></div>
        </div>
        <div style={{ width: "30%" }}>
          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Transportation Details:</div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Transport Name:</span><span>ARYION interstate Transport service</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Vehicle Number:</span><span>KA 8A8A 7878</span></div>
          <div style={{ display: "flex", gap: 10, fontSize: 9.5, marginBottom: 4 }}><span style={{ color: TEXT_MUTED, width: 80 }}>Delivery Date:</span><span>05 - Jun - 2020</span></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 20 }}>
        <thead>
          <tr style={{ background: purpleBg }}>
            {["#", "Item name", "HSN / SAC", "Quantity", "Price/unit", "Discount", "GST", "Amount"].map((h) => (
              <th key={h} style={{ ...th, borderRight: `1px solid #fff` }}>{h}</th>
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
            <td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: 9.5 }} colSpan={3}>Total</td>
            <td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: 9.5 }}>9 + 1</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: 9.5 }} /><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: 9.5 }}>Rs 2,312.72</td><td style={{ padding: "6px 8px", borderRight: `1px solid #fff`, fontSize: 9.5 }}>Rs 10,702.11</td><td style={{ padding: "6px 8px", fontSize: 9.5 }}>Rs 1,02,201.89</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Pay To:</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 4 }}>Bank Name: ICICI BANK, Branch - HSR LAYOUT</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 4 }}>Bank Account No.: 1234567890</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 4 }}>Bank SWIFT code: IFSC000123</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 12 }}>IBAN: AE12 3456 7890 1234 5678 901</div>

          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Invoice Amount In Words</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 12 }}>One Lakh Two Thousand Four Hundred Fifty Two Rupees only</div>

          <div style={{ fontSize: 14, color: purpleBg, marginBottom: 8 }}>Terms And Conditions</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginBottom: 20 }}>Thanks for doing business with us!</div>

          <div style={{ fontSize: 9.5, color: TEXT_DARK, marginBottom: 6 }}>For: My Company</div>
          <div style={{ width: 80, height: 60, background: "#f3f4f6", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 6, fontSize: 10, color: TEXT_MUTED }}>Image</div>
          <div style={{ fontSize: 12, color: TEXT_DARK, fontWeight: 700 }}>Authorized Signatory</div>
        </div>
        
        <div style={{ width: 220, fontSize: 9.5 }}>
          <div style={{ border: `1px solid ${BORDER}`, borderBottom: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Sub Total</span><span>Rs 93,751.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Discount</span><span>Rs 2,312.72</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@3%</span><span>Rs 18.45</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@5%</span><span>Rs 153.66</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>IGST@12%</span><span>Rs 10,530.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Ad. CESS</span><span>Rs 61.50</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Shipping</span><span>Rs 250.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Round off</span><span>Rs 0.11</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: purpleBg, color: "#fff", fontWeight: 700 }}><span>Total</span><span>Rs 1,02,452.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Received</span><span>Rs 50,000.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}` }}><span>Balance</span><span>Rs 52,452.00</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, background: lightPurpleBg, color: purpleBg, fontWeight: 700 }}><span>You Saved</span><span>Rs 32.32</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
