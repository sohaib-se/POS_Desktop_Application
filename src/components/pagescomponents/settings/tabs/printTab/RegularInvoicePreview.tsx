import { BLUE, BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";
import { useCompanyDetails } from "./useCompanyDetails";

export function RegularInvoicePreview({ color: _color }: { color?: string }) {
  const { companyName, phone, email, address, logo, showCompanyName, showPhone, showEmail, showAddress, showLogo } = useCompanyDetails();
  const th: React.CSSProperties = {
    padding: "3px 5px",
    textAlign: "left",
    fontWeight: 500,
  };
  const td: React.CSSProperties = { padding: "3px 5px", color: TEXT_DARK };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
        Tax Invoice
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {showLogo && (
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "transparent",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color: TEXT_MUTED,
              overflow: "hidden"
            }}
          >
{logo ? (
              <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>
        )}
        <div>
          {showCompanyName && <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK }}>{companyName}</div>}
          {showPhone && (
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>
              Phone: <strong style={{ color: TEXT_DARK }}>{phone}</strong>
            </div>
          )}
          {showEmail && (
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>
              Email: <strong style={{ color: TEXT_DARK }}>{email}</strong>
            </div>
          )}
          {showAddress && (
            <div style={{ fontSize: 10, color: TEXT_MUTED }}>
              Address: <strong style={{ color: TEXT_DARK }}>{address}</strong>
            </div>
          )}
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          <tr style={{ border: `1px solid ${BORDER}` }}>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Bill To:</div>
              <div style={{ color: BLUE }}>Classic enterprises</div>
              <div style={{ color: TEXT_MUTED }}>Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</div>
              <div style={{ color: TEXT_MUTED }}>Contact No.: 8888888888</div>
            </td>
            <td style={{ ...td, verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Invoice Details:</div>
              <div>Invoice No.: Inv. 101</div>
              <div>Date: 02-07-2019</div>
              <div>Time: 12:30 PM</div>
              <div>Due Date: 17-07-2019</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: 10, marginBottom: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>Ship To:</div>
        <div style={{ color: TEXT_MUTED }}>Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</div>
      </div>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", marginBottom: 10 }}>
        <thead>
          <tr style={{ background: BLUE, color: "#fff" }}>
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
            <td style={td}>Rs 10.00</td>
            <td style={td}>Rs 0.10 (1%)</td>
            <td style={td}>Rs 0.50 (5%)</td>
            <td style={td}>Rs 10.40</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
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
            <td style={td} colSpan={3}>
              Total
            </td>
            <td style={td}>2 + 1</td>
            <td style={td} />
            <td style={td}>Rs 0.10</td>
            <td style={td}>Rs 5.90</td>
            <td style={td}>Rs 45.80</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <table style={{ flex: 2, fontSize: 9, borderCollapse: "collapse", border: `1px solid ${BORDER}` }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {["HSN/ SAC", "Taxable amount(Rs)", "CGST", "SGST", "Total Tax Amount(Rs)"].map((h) => (
                <th key={h} style={{ ...th, borderBottom: `1px solid ${BORDER}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td} />
              <td style={td}>Rs 50.20</td>
              <td style={td}>2.5% · Rs 1.26</td>
              <td style={td}>2.5% · Rs 1.26</td>
              <td style={td}>Rs 680,002.52</td>
            </tr>
            <tr>
              <td style={td} />
              <td style={td}>Rs 30.00</td>
              <td style={td}>9.0% · Rs 2.70</td>
              <td style={td}>9.0% · Rs 2.70</td>
              <td style={td}>Rs 5.40</td>
            </tr>
            <tr style={{ fontWeight: 600 }}>
              <td style={td}>Total</td>
              <td style={td}>Rs 80.20</td>
              <td style={td}>Rs 3.96</td>
              <td style={td}>Rs 3.96</td>
              <td style={td}>Rs 9.92</td>
            </tr>
          </tbody>
        </table>
        <div style={{ flex: 1, fontSize: 9.5, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 6 }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Invoice Amount In Words:</strong>
            <div style={{ color: TEXT_MUTED }}>Forty Two Rupees and Thirty Two Paisa only</div>
          </div>
          <div>Received: <strong>Rs 12.00</strong></div>
          <div>Balance: <strong>Rs 30.32</strong></div>
          <div>You Saved: <strong>Rs 111.60</strong></div>
        </div>
      </div>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ ...td, border: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Description:</div>
              <div style={{ color: TEXT_MUTED }}>Sale Description</div>
            </td>
            <td style={{ ...td, border: `1px solid ${BORDER}`, verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Terms &amp; Conditions:</div>
              <div style={{ color: TEXT_MUTED }}>Thanks for doing business with us!</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: 9.5, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...td, border: `1px solid ${BORDER}`, width: "60%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Bank Details:</div>
              <div style={{ color: TEXT_MUTED }}>Bank Name: 123123123123</div>
              <div style={{ color: TEXT_MUTED }}>Bank Account No.: 12312312312</div>
              <div style={{ color: TEXT_MUTED }}>Bank IFSC code: 123123123</div>
              <div style={{ color: TEXT_MUTED }}>IBAN: AE12 3456 7890 1234 5678 901</div>
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
