import { BLUE, BORDER, THEME_COLORS } from "./constants";

const colorNames: Record<string, string> = {
  "#94a3b8": "Slate",
  "#0ea5e9": "Sky Blue",
  "#9ca3af": "Light Gray",
  "#4b5563": "Dark Gray",
  "#6b7280": "Gray",
  "#3b82f6": "Blue",
  "#06b6d4": "Cyan",
  "#22c55e": "Green",
  "#14b8a6": "Teal",
  "#8b5cf6": "Violet",
  "#a855f7": "Purple",
  "#ec4899": "Pink",
  "#f59e0b": "Amber",
  "#78350f": "Brown",
  "#f9a8d4": "Light Pink",
  "#f97316": "Orange",
  "#ef4444": "Red",
  "#7c2d12": "Dark Orange",
  "#92400e": "Dark Amber",
  "#ffffff": "White",
};

export function getColorName(hex: string) {
  return colorNames[hex.toLowerCase()] || "Custom Color";
}

export function ColorGrid({ color, onColorChange }: { color: string; onColorChange: (c: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, maxWidth: 420 }}>
      {THEME_COLORS.map((c, i) => (
        <button
          key={i}
          title={`${getColorName(c)} (${c.toUpperCase()})`}
          onClick={() => onColorChange(c)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: c,
            border: color === c ? `2px solid ${BLUE}` : c === "#ffffff" ? `1px solid ${BORDER}` : "2px solid transparent",
            boxShadow: color === c ? "0 0 0 1.5px #fff inset" : "none",
            cursor: "pointer",
            padding: 0 }}
        />
      ))}
    </div>
  );
}
