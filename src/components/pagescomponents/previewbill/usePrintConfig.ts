import { useState, useEffect } from "react";
import { THEME_COLORS } from "../settings/tabs/printTab/constants";

export interface PrintConfig {
  activePrinter: "regular" | "thermal";
  regularThemeIdx: number;
  thermalThemeIdx: number;
  themeColor: string;
}

function readPrintConfig(): PrintConfig {
  return {
    activePrinter: (localStorage.getItem("print_activePrinter") as "regular" | "thermal") || "regular",
    regularThemeIdx: (() => {
      const saved = localStorage.getItem("print_regularThemeIdx");
      return saved !== null ? parseInt(saved, 10) : 1;
    })(),
    thermalThemeIdx: (() => {
      const saved = localStorage.getItem("print_thermalThemeIdx");
      return saved !== null ? parseInt(saved, 10) : 2;
    })(),
    themeColor: localStorage.getItem("print_themeColor") || THEME_COLORS[9],
  };
}

/** Reads the active print configuration from localStorage (same source as PrintTab). */
export function usePrintConfig(): PrintConfig {
  const [config, setConfig] = useState<PrintConfig>(readPrintConfig);

  useEffect(() => {
    const handleUpdate = () => setConfig(readPrintConfig());
    window.addEventListener("company-details-update", handleUpdate);
    return () => window.removeEventListener("company-details-update", handleUpdate);
  }, []);

  return config;
}
