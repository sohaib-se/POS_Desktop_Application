import { BLUE, BORDER, THEME_COLORS } from "./constants";

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
            padding: 0 }}
        />
      ))}
    </div>
  );
}
