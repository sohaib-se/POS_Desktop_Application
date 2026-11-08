

import { useTranslation } from "react-i18next";

interface TopBarProps {}

export function TopBar({}: TopBarProps = {}) {
  const { t } = useTranslation();

  return (
    <div style={{ background: "#fff", flexShrink: 0, padding: "8px 20px", display: "flex", alignItems: "center", gap: 20, borderBottom: "1px solid #e5e7eb" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{t("estimates.title")}</span>
    </div>
  );
}
