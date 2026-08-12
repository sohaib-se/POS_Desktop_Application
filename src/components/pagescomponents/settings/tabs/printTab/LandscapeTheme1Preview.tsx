import { BLUE, BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";

export function LandscapeTheme1Preview({ color }: { color?: string }) {
  const th: React.CSSProperties = {
    padding: "3px 5px",
    textAlign: "left",
    fontWeight: 500,
  };
  const td: React.CSSProperties = { padding: "3px 5px", color: TEXT_DARK };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif", width: "100%", overflowX: "auto" }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15, marginBottom: 14, borderBottom: `1px solid ${BORDER}`, paddingBottom: 8 }}>
        Tax Invoice
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 50,
              height: 50,
              background: "#f3f4f6",
              border: `1px dashed ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: TEXT_MUTED,
            }}
          >
            Image
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK }}>My Company</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>
              Phone: <strong style={{ color: TEXT_DARK }}>3369007084</strong>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, textAlign: "right" }}>
          <div>Invoice No.: Inv. 101</div>
          <div>Date: 02-07-2019</div>
          <div>Time: 12:30 PM</div>
          <div>Due Date: 17-07-2019</div>
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", marginBottom: 10, border: `1px solid ${BORDER}` }}>
        <tbody>
          <tr>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Bill To:</div>
              <div style={{ color: TEXT_DARK, fontWeight: 500 }}>Classic enterprises</div>
              <div style={{ color: TEXT_MUTED }}>Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</div>
              <div style={{ color: TEXT_MUTED }}>Contact No.: 8888888888</div>
            </td>
            <td style={{ ...td, verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Ship To:</div>
              <div style={{ color: TEXT_MUTED }}>Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", marginBottom: 10 }}>
        <thead>
          <tr style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
            {["#", "Item name", "HSC/SAC", "Quantity", "Price/unit", "Discount", "GST", "Amount"].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={td}>1</td>
            <td style={td}>ITEM 1</td>
            <td style={td}>1234</td>
            <td style={td}>1+1</td>
            <td style={td}>10.00</td>
            <td style={td}>0.10 (1%)</td>
            <td style={td}>0.50 (5%)</td>
            <td style={td}>10.40</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={td}>2</td>
            <td style={td}>ITEM 2</td>
            <td style={td}>6325</td>
            <td style={td}>1</td>
            <td style={td}>30.00</td>
            <td style={td}>0.00 (0%)</td>
            <td style={td}>5.40 (18%)</td>
            <td style={td}>35.40</td>
          </tr>
          <tr style={{ fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>
            <td style={td} colSpan={3}>TOTAL</td>
            <td style={td}>2 + 1</td>
            <td style={td} />
            <td style={td}>0.10</td>
            <td style={td}>5.90</td>
            <td style={td}>45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", fontSize: 9.5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Sub Total: <strong>45.80</strong></div>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Discount (12%): <strong>5.50</strong></div>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Tax (5%): <strong>2.02</strong></div>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>TCS (1%): <strong>0.42</strong></div>
        <div style={{ flex: 2, padding: 4 }}>Total: <strong>Rs 42.32 (Forty Two Rupees and Thirty Two Paisa only)</strong></div>
      </div>
      
      <div style={{ display: "flex", fontSize: 9.5, border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Received: <strong>12.00</strong></div>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Balance: <strong>30.32</strong></div>
        <div style={{ flex: 1, borderRight: `1px solid ${BORDER}`, padding: 4 }}>Current Balance: <strong>1,24,097.11</strong></div>
        <div style={{ flex: 1, padding: 4 }}>You Saved: <strong>111.60</strong></div>
      </div>

      <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse", border: `1px solid ${BORDER}`, marginBottom: 10 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <th rowSpan={2} style={{ ...th, borderRight: `1px solid ${BORDER}` }}>HSN/ SAC</th>
            <th rowSpan={2} style={{ ...th, borderRight: `1px solid ${BORDER}` }}>Taxable amount(Rs)</th>
            <th colSpan={2} style={{ ...th, borderRight: `1px solid ${BORDER}`, textAlign: "center" }}>CGST</th>
            <th colSpan={2} style={{ ...th, borderRight: `1px solid ${BORDER}`, textAlign: "center" }}>SGST</th>
            <th rowSpan={2} style={{ ...th }}>Total Tax Amount(Rs)</th>
          </tr>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            <th style={{ ...th, borderRight: `1px solid ${BORDER}` }}>Rate(%)</th>
            <th style={{ ...th, borderRight: `1px solid ${BORDER}` }}>Amount(Rs)</th>
            <th style={{ ...th, borderRight: `1px solid ${BORDER}` }}>Rate(%)</th>
            <th style={{ ...th, borderRight: `1px solid ${BORDER}` }}>Amount(Rs)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }} />
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>50.20</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>2.5%</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>1.26</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>2.5%</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>1.26</td>
            <td style={td}>680,002.52</td>
          </tr>
          <tr>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }} />
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>30.00</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>9.0%</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>2.70</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>9.0%</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>2.70</td>
            <td style={td}>5.40</td>
          </tr>
          <tr style={{ fontWeight: 600, borderTop: `1px solid ${BORDER}` }}>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>Total</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>80.20</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }} />
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>3.96</td>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }} />
            <td style={{ ...td, borderRight: `1px solid ${BORDER}` }}>3.96</td>
            <td style={td}>9.92</td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...td, border: `1px solid ${BORDER}`, width: "33%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Description:</div>
              <div style={{ color: TEXT_MUTED }}>Sale Description</div>
            </td>
            <td style={{ ...td, border: `1px solid ${BORDER}`, width: "33%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Terms &amp; Conditions:</div>
              <div style={{ color: TEXT_MUTED }}>Thanks for doing business with us!</div>
            </td>
            <td style={{ ...td, border: `1px solid ${BORDER}`, verticalAlign: "top", textAlign: "center" }}>
              <div style={{ fontWeight: 600, marginBottom: 6, textAlign: "left" }}>For: My Company:</div>
              <div
                style={{
                  width: 60,
                  height: 30,
                  background: "#f3f4f6",
                  borderRadius: 4,
                  margin: "0 auto 6px",
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
