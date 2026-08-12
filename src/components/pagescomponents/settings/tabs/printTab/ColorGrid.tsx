import { BLUE, BORDER } from "./constants";

export const THEME_COLORS = [
  "#94a3b8", "#0ea5e9", "#9ca3af", "#4b5563", "#6b7280", "#3b82f6",
  "#06b6d4", "#22c55e", "#14b8a6", "#8b5cf6", "#a855f7", "#ec4899",
  "#f59e0b", "#78350f",
  "#f9a8d4", "#f97316", "#ef4444", "#7c2d12", "#92400e", "#ffffff",
];

export function ColorGrid({ color, onColorChange }: { color: string; onColorChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, maxWidth: 420 }}>
      {THEME_COLORS.map((c, i) => (
        <button
          key={i}
          onClick={() => onColorChange(c)}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: c,
            border: color === c ? `2px solid ${BLUE}` : c === "#ffffff" ? `1px solid ${BORDER}` : "2px solid transparent",
            boxShadow: color === c ? "0 0 0 1.5px #fff inset" : "none",
            cursor: "pointer",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}
