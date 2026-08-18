import type { BillPreviewSaleData } from "../../../previewbill/BillPreviewData";
import { DUMMY_REGULAR_SALE } from "./DummySaleData";
import { BLUE, BORDER, TEXT_DARK, TEXT_MUTED } from "./constants";
import { useCompanyDetails } from "./useCompanyDetails";

export function RegularInvoicePreview({ color, sale }: { color?: string, sale?: BillPreviewSaleData }) {
  const data = sale || DUMMY_REGULAR_SALE;
  const { companyName, phone, email, address, logo, showCompanyName, showPhone, showEmail, showAddress, showLogo , companyNameTextSize, invoiceTextSize } = useCompanyDetails();

  const companyNameSize = companyNameTextSize === "Small" ? 14 : companyNameTextSize === "Large" ? 22 : 18;
  const invoiceFontSize = invoiceTextSize === "Small" ? 8.5 : invoiceTextSize === "Large" ? 11.5 : 10;

  const th: React.CSSProperties = {
    padding: "3px 5px",
    textAlign: "left",
    fontWeight: 500,
  };
  const td: React.CSSProperties = { padding: "3px 5px", color: TEXT_DARK };

  return (
    <div style={{ background: "#fff", borderRadius: 4, padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: companyNameSize, marginBottom: 14 }}>
        Tax Invoice
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
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
              fontSize: invoiceFontSize,
              color: TEXT_MUTED,
              overflow: "hidden"
            }}
          >
{logo ? (
              <img src={logo} alt="Company Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
          </div>
        )}
        <div style={{ textAlign: "right" }}>
          {showCompanyName && <div style={{ fontSize: companyNameSize, fontWeight: 700, color: TEXT_DARK }}>{companyName}</div>}
          {showPhone && (
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>
              Phone: <strong style={{ color: TEXT_DARK }}>{phone}</strong>
            </div>
          )}
          {showEmail && (
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>
              Email: <strong style={{ color: TEXT_DARK }}>{email}</strong>
            </div>
          )}
          {showAddress && (
            <div style={{ fontSize: invoiceFontSize, color: TEXT_MUTED }}>
              Address: <strong style={{ color: TEXT_DARK }}>{address}</strong>
            </div>
          )}
        </div>
      </div>

        <>
          <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", marginBottom: 10 }}>
        <tbody>
          <tr style={{ border: `1px solid ${BORDER}` }}>
            <td style={{ ...td, borderRight: `1px solid ${BORDER}`, width: "50%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Bill To:</div>
              <div style={{ color: color || BLUE }}>{data.partyName}</div>
              
              {data.partyPhone ? <div style={{ color: TEXT_MUTED }}>Contact No.: {data.partyPhone}</div> : null}
            </td>
            <td style={{ ...td, verticalAlign: "top" }}>
              <div style={{ fontWeight: 600, marginBottom: 3 }}>Invoice Details:</div>
              <div>Invoice No.: {data.invoiceNo}</div>
              <div>Date: {data.date}</div>
              
              <div>Due Date: {data.date}</div>
            </td>
          </tr>
        </tbody>
      </table>

      

      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", marginBottom: 10 }}>
        <thead>
          <tr style={{ background: color || BLUE, color: "#fff" }}>
            {["#", "Item name", "HSN/SAC", "Quantity", "Price/unit"].map((h) => (
              <th key={h} style={th}>{h}</th>
            ))}
            {data.discountAmount > 0 && <th style={th}>Discount</th>}
            {data.taxAmount > 0 && <th style={th}>GST</th>}
            <th style={th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((item, idx) => (
            <tr key={item.id ?? idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td style={td}>{idx + 1}</td>
              <td style={td}>{item.name}</td>
              <td style={td}></td>
              <td style={td}>{item.quantity} {item.unit !== "NONE" ? item.unit : ""}</td>
              <td style={td}>Rs {item.price.toFixed(2)}</td>
              {data.discountAmount > 0 && <td style={td}></td>}
              {data.taxAmount > 0 && <td style={td}></td>}
              <td style={td}>Rs {item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 600 }}>
            <td style={td} colSpan={3}>Total</td>
            <td style={td}>{data.lineItems.reduce((sum, i) => sum + i.quantity, 0)}</td>
            <td style={td} />
            {data.discountAmount > 0 && <td style={td}>Rs {(data.discountAmount || 0).toFixed(2)}</td>}
            {data.taxAmount > 0 && <td style={td}>Rs {(data.taxAmount || 0).toFixed(2)}</td>}
            <td style={td}>Rs {data.subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {data.taxAmount > 0 && (
          <table style={{ flex: 2, fontSize: invoiceFontSize, borderCollapse: "collapse", border: `1px solid ${BORDER}` }}>
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
            {data.taxAmount > 0 && (
              <tr>
                <td style={td} />
                <td style={td}>Rs {data.subtotal.toFixed(2)}</td>
                <td style={td}>{(data.taxRate * 100 / 2).toFixed(1)}% · Rs {(data.taxAmount / 2).toFixed(2)}</td>
                <td style={td}>{(data.taxRate * 100 / 2).toFixed(1)}% · Rs {(data.taxAmount / 2).toFixed(2)}</td>
                <td style={td}>Rs {data.taxAmount.toFixed(2)}</td>
              </tr>
            )}
            <tr style={{ fontWeight: 600 }}>
              <td style={{ ...td, borderBottom: "none" }}>Total</td>
              <td style={{ ...td, borderBottom: "none" }}>Rs {data.subtotal.toFixed(2)}</td>
              <td style={{ ...td, borderBottom: "none" }} />
              <td style={{ ...td, borderBottom: "none" }} />
              <td style={{ ...td, borderBottom: "none" }}>Rs {data.taxAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        )}
        <div style={{ flex: 1, fontSize: invoiceFontSize, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 6, marginBottom: 10 }}>
          <div style={{ marginBottom: 4 }}>
            <strong>Invoice Amount In Words:</strong>
            <div style={{ color: TEXT_MUTED }}>Forty Two Rupees and Thirty Two Paisa only</div>
          </div>
          <div>Received: <strong>Rs {data.received.toFixed(2)}</strong></div>
          <div>Balance: <strong>Rs {data.balance.toFixed(2)}</strong></div>
          {data.discountAmount > 0 && <div>You Saved: <strong>Rs {(data.discountAmount || 0).toFixed(2)}</strong></div>}
        </div>
      </div>

      {(data.description || data.termsAndConditions) && (
        <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse", marginBottom: 10 }}>
          <tbody>
            <tr>
              {data.description && (
                <td style={{ ...td, border: `1px solid ${BORDER}`, width: data.termsAndConditions ? "50%" : "100%", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Description:</div>
                  {data.description}
                </td>
              )}
              {data.termsAndConditions && (
                <td style={{ ...td, border: `1px solid ${BORDER}`, width: data.description ? "50%" : "100%", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Terms &amp; Conditions:</div>
                  <div style={{ color: TEXT_MUTED }}>{data.termsAndConditions}</div>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      )}

      <table style={{ width: "100%", fontSize: invoiceFontSize, borderCollapse: "collapse" }}>
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
        </>
    </div>
  );
}
