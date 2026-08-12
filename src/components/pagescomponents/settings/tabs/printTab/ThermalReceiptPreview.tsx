import { TEXT_DARK, TEXT_MUTED } from "./constants";

export function ThermalReceiptPreview() {
  const dash: React.CSSProperties = {
    borderTop: `1px dashed ${TEXT_MUTED}`,
    margin: "6px 0",
  };
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 4,
        padding: "16px 14px",
        fontFamily: "'Courier New', monospace",
        fontSize: 9,
        color: TEXT_DARK,
        maxWidth: 260,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", fontWeight: 700 }}>My Company</div>
      <div style={{ textAlign: "center", color: TEXT_MUTED }}>Ph No: 3369007084</div>
      <div style={dash} />
      <div style={{ fontWeight: 700 }}>Invoice</div>
      <div>Vyopar tech solutions (Sample Party Name)</div>
      <div>Ph No: (+971) 4 549 0404</div>
      <div>Bill To:</div>
      <div>Sarjapur Road, Banglore</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Date: 11/08/2026</span>
        <span>Invoice No: Inv12345</span>
      </div>
      <div style={dash} />
      <div style={{ display: "flex", fontWeight: 700 }}>
        <span style={{ flex: 1 }}>Item Name</span>
        <span>Amount</span>
      </div>
      <div>1&nbsp;&nbsp;Britannia Chocolate Cake</div>
      <div style={{ color: TEXT_MUTED }}>Britannia Chocolate Cake description</div>
      <div style={{ color: TEXT_MUTED }}>Batch No: N1234, Model No: A12345, Exp. Date: 08/2027, Mfg. Date: 11/08/2026, Size: Med/32</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>100 + Dscn</span>
        <span>10,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Final amount</span>
        <span>10,000.00</span>
      </div>
      <div>2&nbsp;&nbsp;Cadbury Chocolate</div>
      <div style={{ color: TEXT_MUTED }}>Cadbury cake description</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>50 + 1 Disc</span>
        <span>7,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Final amount</span>
        <span>7,500.00</span>
      </div>
      <div style={dash} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Qty: 150 + 1</span>
        <span>17,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Disc(0%)</span>
        <span>-500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Tax(0%)</span>
        <span>500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Total Disc.</span>
        <span>-1,500.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span>Total</span>
        <span>20,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Received</span>
        <span>20,000.00</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Balance</span>
        <span>0.00</span>
      </div>
      <div style={dash} />
      <div style={{ textAlign: "center" }}>Balance to be paid in 5 days.</div>
    </div>
  );
}
