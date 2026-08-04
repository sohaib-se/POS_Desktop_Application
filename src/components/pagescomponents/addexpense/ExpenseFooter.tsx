interface ExpenseFooterProps {
  saveError: string;
  isSaving: boolean;
  onShare?: () => void;
  handleSaveExpense: () => void;
}

export function ExpenseFooter({
  saveError,
  isSaving,
  onShare,
  handleSaveExpense,
}: ExpenseFooterProps) {
  return (
    <div style={{ background: "#fff", flexShrink: 0, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid #e5e7eb" }}>
      <div style={{ fontSize: 12, color: "#b91c1c", minHeight: 16 }}>
        {saveError}
      </div>
      <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden" }}>
        <button
          onClick={onShare}
          style={{ padding: "7px 20px", fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", border: "none", cursor: "pointer" }}
        >
          Share
        </button>
        <button style={{ padding: "7px 8px", fontSize: 13, color: "#6b7280", background: "#fff", border: "none", borderLeft: "1px solid #d1d5db", cursor: "pointer" }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <button
        onClick={handleSaveExpense}
        disabled={isSaving}
        style={{ padding: "7px 32px", fontSize: 13, fontWeight: 700, color: "#fff", background: isSaving ? "#93c5fd" : "#2563eb", border: "none", borderRadius: 4, cursor: isSaving ? "not-allowed" : "pointer", boxShadow: "0 1px 4px rgba(37,99,235,0.3)" }}
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
