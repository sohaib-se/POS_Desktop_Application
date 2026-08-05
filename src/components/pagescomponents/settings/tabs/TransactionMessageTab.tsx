import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CheckRow, Hint } from "../shared/SharedComponents";
import { SH } from "../shared/styles";

export function TransactionMessageTab() {
  const [txnType, setTxnType] = useState("Sales Transaction");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        height: "100%",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          padding: "24px 28px",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
        }}
      >
        <div style={SH}>Transaction Message</div>

        {/* Select message type */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 10 }}>
            Select Message Type:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 16px",
              }}
            >
              {/* WhatsApp icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.099 1.508 5.822L.057 23.7a.75.75 0 00.917.913l5.938-1.547A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-5.07-1.428l-.364-.213-3.773.983.997-3.68-.236-.378A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              <span style={{ fontSize: 13, color: "#374151" }}>
                Send via Personal WhatsApp
              </span>
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #2563eb",
                  color: "#2563eb",
                  borderRadius: 5,
                  padding: "3px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Message Recipient Settings */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            Message Recipient Settings:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <CheckRow label="Send Message to Party" hint defaultChecked />
            <CheckRow
              label="Send Transaction Update Message"
              hint
              extra={
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "inline-block",
                      marginLeft: 4,
                    }}
                  />
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#2563eb",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#fff",
                      marginLeft: 4,
                    }}
                  >
                    M
                  </span>
                </>
              }
            />
            <CheckRow
              label="Send Message Copy to Self"
              hint
              extra={
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#2563eb",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    marginLeft: 4,
                  }}
                >
                  M
                </span>
              }
            />
          </div>
        </div>

        {/* Message Content */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Message Content:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <CheckRow label="Party Current Balance in Message" hint />
            <CheckRow label="Web invoice link in Message" hint defaultChecked />
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              margin: "14px 0 8px",
            }}
          >
            Send Automatic Message for:
          </div>
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 6,
            }}
          >
            {[
              { label: "Sales", checked: true },
              { label: "Purchase", checked: true },
              { label: "Sales Return", checked: true },
              { label: "Purchase Return", checked: true },
              { label: "Payment In", checked: true },
              { label: "Payment Out", checked: true },
              { label: "Sale Order", checked: true },
              { label: "Purchase Order", checked: false },
              { label: "Estimate", checked: false },
              { label: "Proforma Invoice", checked: false },
              { label: "Delivery Challan", checked: false },
              { label: "Cancelled Invoice", checked: true },
            ].map((item) => (
              <CheckRow
                key={item.label}
                label={item.label}
                defaultChecked={item.checked}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – Edit Message */}
      <div
        style={{ padding: "24px 20px", background: "#fff", overflowY: "auto" }}
      >
        {/* Transaction type selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 12, color: "#374151" }}>
            Transaction Type :
          </span>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              color: "#374151",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {txnType} <ChevronDown size={13} />
          </button>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Edit Message
        </div>

        {/* Message editor */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <textarea
            defaultValue={
              "Thanks for your purchase with us!!\nPurchase Details:"
            }
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 12,
              color: "#374151",
              fontFamily: "inherit",
              minHeight: 60,
            }}
          />
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 10,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
              Invoice Amount: 792
              <br />
              Received: 300
              <br />
              Balance: 492
              <br />
              Total Balance: 800
            </div>
          </div>
          {/* Footer */}
          <div
            style={{
              borderTop: "1px dashed #d1d5db",
              marginTop: 10,
              paddingTop: 8,
            }}
          >
            <input
              placeholder="Footer"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 12,
                color: "#9ca3af",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Message Preview */}
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Message Preview
        </div>
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>
              Transaction Image Attached
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
            Thanks for your purchase with us!!
            <br />
            Purchase Details:
            <br />
            Invoice Amount: 792
            <br />
            Received: 300
            <br />
            Balance: 492
            <br />
            Total Balance: 800
          </div>
        </div>
      </div>
    </div>
  );
}
