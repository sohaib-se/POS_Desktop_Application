

interface FooterProps {
  onShare?: () => void;
  onSave?: () => void;
}

export function Footer({ onShare, onSave }: FooterProps) {
  return (
    <div style={{ background: "#fff", flexShrink: 0, padding: "10px 20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, borderTop: "1px solid #e5e7eb" }}>

      <button onClick={onSave}
        style={{ padding: "7px 32px", fontSize: 13, fontWeight: 700, color: "#fff", background: "#2563eb", border: "none", borderRadius: 4, cursor: "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.3)" }}>
        Save
      </button>
    </div>
  );
}
