export const BLUE = "#2563eb";
export const BLUE_LIGHT = "#dbeafe";
export const BORDER = "#e5e7eb";
export const TEXT_MUTED = "#6b7280";
export const TEXT_LABEL = "#374151";
export const TEXT_DARK = "#111827";
export const ACCENT_UNDERLINE = "#e5397d";

export const THEME_COLORS = [
  "#94a3b8", "#0ea5e9", "#9ca3af", "#4b5563", "#6b7280", "#3b82f6",
  "#06b6d4", "#22c55e", "#14b8a6", "#8b5cf6", "#a855f7", "#ec4899",
  "#f59e0b", "#78350f",
  "#f9a8d4", "#f97316", "#ef4444", "#7c2d12", "#92400e", "#ffffff",
];

/**
 * Returns the effective color to use for borders, headers, and accents.
 * When white (#ffffff) is selected it falls back to near-black (#1a1a1a)
 * to keep borders and headers visible on a white background.
 */
export function resolveThemeColor(color: string): string {
  return color.trim().toLowerCase() === "#ffffff" ? "#1a1a1a" : color;
}

