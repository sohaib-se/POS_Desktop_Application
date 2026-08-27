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
