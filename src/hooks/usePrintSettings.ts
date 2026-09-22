/**
 * usePrintSettings — global print toggle settings backed by localStorage.
 *
 * RightPanel writes to localStorage via set* helpers.
 * All theme components read from localStorage so they reflect the user's
 * current choices without needing prop drilling through the entire tree.
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "print_totals_settings";

export interface PrintTotalsSettings {
  /** Show the total item quantity row in the invoice */
  totalItemQuantity: boolean;
  /** Show amounts with decimal places (.00) */
  amountWithDecimal: boolean;
  /** Show the received amount row */
  receivedAmount: boolean;
  /** Show the balance amount row */
  balanceAmount: boolean;
  /** Show the current balance of party row */
  currentBalanceOfParty: boolean;
  /** Show previous balance row */
  previousBalance: boolean;
  /** Show tax details row */
  taxDetails: boolean;
  /** Show discount row */
  discount: boolean;
  /** Show "You Saved" row when discount > 0 */
  youSaved: boolean;
  /** Show Invoice Amount in Words */
  amountInWords: boolean;
  /** Show description */
  printDescription: boolean;
  /** Show terms and conditions */
  printTermsAndConditions: boolean;
  /** Signature text to display */
  printSignatureText: string;
  /** Show payment mode */
  paymentMode: boolean;
  // ── Item table column visibility ──
  /** Show the S.NO (#) column in the item table */
  showSno: boolean;
  /** Show the Quantity column in the item table */
  showQuantity: boolean;
  /** Show the Unit column in the item table */
  showUnit: boolean;
  /** Show the Price/Unit column in the item table */
  showPricePerUnit: boolean;
}

export const DEFAULT_PRINT_TOTALS: PrintTotalsSettings = {
  totalItemQuantity: true,
  amountWithDecimal: true,
  receivedAmount: true,
  balanceAmount: true,
  currentBalanceOfParty: true,
  previousBalance: true,
  taxDetails: true,
  discount: true,
  youSaved: true,
  amountInWords: true,
  printDescription: false,
  printTermsAndConditions: false,
  printSignatureText: "Authorized Signatory",
  paymentMode: false,
  // Item table columns — all visible by default
  showSno: true,
  showQuantity: true,
  showUnit: true,
  showPricePerUnit: true,
};

/** Read settings from localStorage (falls back to defaults). */
export function getPrintTotalsSettings(): PrintTotalsSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PRINT_TOTALS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_PRINT_TOTALS };
}

/** Persist settings to localStorage and notify listeners. */
export function setPrintTotalsSettings(settings: PrintTotalsSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Dispatch a custom event so any mounted theme component can re-render
    window.dispatchEvent(new CustomEvent("print-settings-changed", { detail: settings }));
  } catch {
    // ignore storage errors
  }
}

/**
 * React hook — subscribes to print settings changes fired by RightPanel.
 * Import this into each theme component that needs to respect the toggles.
 */
export function usePrintTotalsSettings(): PrintTotalsSettings {
  const [settings, setSettings] = useState<PrintTotalsSettings>(getPrintTotalsSettings);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<PrintTotalsSettings>).detail;
      setSettings({ ...DEFAULT_PRINT_TOTALS, ...detail });
    };
    const draftHandler = (e: Event) => {
      const detail = (e as CustomEvent<Partial<PrintTotalsSettings>>).detail;
      setSettings(prev => ({ ...prev, ...detail }));
    };
    window.addEventListener("print-settings-changed", handler);
    window.addEventListener("print-settings-draft", draftHandler);
    return () => {
      window.removeEventListener("print-settings-changed", handler);
      window.removeEventListener("print-settings-draft", draftHandler);
    };
  }, []);

  return settings;
}
