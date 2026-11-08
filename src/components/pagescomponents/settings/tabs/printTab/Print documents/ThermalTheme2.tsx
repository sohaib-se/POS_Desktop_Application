import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/useSettings";
import { userProfile } from "@/data/mockData";
import { usePrintTotalsSettings } from "@/hooks/usePrintSettings";

/* ─────────────────────────────── Types ─────────────────────────────── */

interface SaleInvoiceLineItem {
    id?: string | number;
    itemName?: string;
    item_name?: string;
    quantity?: number | string;
    unit?: string;
    pricePerUnit?: number | string;
    price_per_unit?: number | string;
    amount?: number | string;
}

interface ThermalTheme2Props {
    records: SaleInvoiceLineItem[];
    invoiceNo: string | number;
    invoiceDate: string;
    customerName: string;
    customerPhone?: string;
    businessProfile?: { business_name?: string; phone?: string; address?: string; email?: string; logo_url?: string; terms_conditions?: string };
    received?: number;
    discount?: number;
    discountPercent?: number;
    taxPercent?: number;
    paymentMode?: string;
    previousBalance?: number;
    documentTitle?: string;
}

/* ─────────────────────── Dummy preview data ────────────────────────── */

const DUMMY_RECORDS: SaleInvoiceLineItem[] = [
    { id: 1, itemName: "Book", quantity: 1, unit: "1Box", pricePerUnit: 100, amount: 100 },
];

/* ──────────────────────────── Logo ──────────────────────────────────── */

function ClassicLogo({
    logoUrl,
    businessName,
    size = 52,
}: {
    logoUrl?: string;
    businessName?: string;
    size?: number;
}) {
    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={businessName ? `${businessName} logo` : "Business logo"}
                style={{
                    width: size,
                    height: size,
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto 6px",
                }}
            />
        );
    }
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: "2px solid #111",
                margin: "0 auto 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.4,
                fontWeight: 800,
                color: "#111",
            }}
        >
            {(businessName || "Laimsoft").charAt(0).toUpperCase()}
        </div>
    );
}

/* ──────────────────── Solid full-width divider ──────────────────────── */

function SolidDivider({ thick = false }: { thick?: boolean }) {
    return (
        <div
            style={{
                borderTop: thick ? "2px solid #111" : "1px solid #111",
                margin: "6px 0",
            }}
        />
    );
}

/* ──────────────────── formatDate ───────────────────────────────────── */

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    if (dateStr.includes("/")) {
        const p = dateStr.split("/");
        if (p.length === 3) return `${p[0].padStart(2, "0")}/${p[1].padStart(2, "0")}/${p[2]}`;
    } else if (dateStr.includes("-")) {
        const p = dateStr.split("T")[0].split("-");
        if (p.length === 3 && p[0].length === 4) return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return dateStr;
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ──────────────────── ThermalSaleInvoice — Classic ──────────────────── */
/*
  This is the layout pattern used by the majority of mainstream POS
  systems (Square, Clover, Toast, Shopify POS, Lightspeed): a centered
  masthead, a solid rule under the header, a plain item list with a
  right-aligned line total, a boxed grand-total, and a short thank-you
  footer. No dashed rules, no color accents — high-contrast black on
  white, optimized for 58/80mm thermal rolls and legibility after
  reprinting/faxing/scanning.
*/

export function ThermalSaleInvoiceClassic({
    records,
    invoiceNo,
    invoiceDate,
    customerName,
    customerPhone,
    businessProfile,
    received = 0,
    discount = 0,
    discountPercent,
    taxPercent = 0,
    paymentMode,
    previousBalance,
    documentTitle = "Invoice",
}: ThermalTheme2Props) {
    const { t } = useTranslation();
    const [currency] = useSettings("settings.businessCurrency", { code: "PKR", symbol: "Rs" });
    const [currencyDisplay] = useSettings<"abbreviation" | "icon">(
        "settings.currencyDisplay",
        "abbreviation"
    );
    void currencyDisplay;
    void currency;

    const ps = usePrintTotalsSettings();

    const totalQuantity = records.reduce((s, r) => s + Number(r.quantity || 0), 0);
    const subTotal = records.reduce((s, r) => s + Number(r.amount || 0), 0);
    const discountAmount = Number(discount || 0) > 0 ? Number(discount) : (discountPercent != null && Number(discountPercent) > 0 ? (subTotal * Number(discountPercent)) / 100 : 0);
    const taxAmount = Number(taxPercent || 0) > 0 ? (subTotal - discountAmount) * (Number(taxPercent) / 100) : 0;
    const total = subTotal - discountAmount + taxAmount;
    const balance = total - Number(received || 0);
    const youSaved = discountAmount;
    const prevBalance = Number(previousBalance ?? 0);
    const currentBalance = (documentTitle === "Purchase Invoice" || documentTitle === "Purchase Bill") ? prevBalance - balance : prevBalance + balance;

    const fmt = (n: number) => ps.amountWithDecimal ? n.toFixed(2) : Math.round(n).toString();

    return (
        <div
            className="thermal-receipt"
            style={{
                background: "#fff",
                color: "#111",
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                width: "100%",
                maxWidth: 380,
                margin: "0 auto",
                padding: "16px 14px 26px",
                boxSizing: "border-box",
                fontSize: 12,
            }}
        >
            {/* ────────── HEADER ────────── */}
            <div style={{ textAlign: "center", marginBottom: 4 }}>
                <ClassicLogo
                    logoUrl={businessProfile?.logo_url}
                    businessName={businessProfile?.business_name}
                />
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.2 }}>
                    {businessProfile?.business_name || "Laimsoft"}
                </div>
                {businessProfile?.address && (
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                        {businessProfile.address}
                    </div>
                )}
                {businessProfile?.phone && (
                    <div style={{ fontSize: 11, color: "#444" }}>{businessProfile.phone}</div>
                )}
                {businessProfile?.email && (
                    <div style={{ fontSize: 11, color: "#444" }}>{t("printThemes.email", "Email")}: {businessProfile.email}</div>
                )}
            </div>

            <SolidDivider thick />

            {/* ────────── META ROW ────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#333" }}>
                <div>
                    <div>{documentTitle && documentTitle !== "Invoice" ? `${documentTitle} #${invoiceNo}` : `${t("printThemes.invoice", "Receipt")} #${invoiceNo}`}</div>
                    <div>{formatDate(invoiceDate)} {formatTime(invoiceDate)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{customerName || ""}</div>
                    {customerPhone && <div>{customerPhone}</div>}
                </div>
            </div>

            <SolidDivider />

            {/* ────────── ITEMS TABLE ────────── */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: "3px 0", fontWeight: 700 }}>{t("printThemes.itemName", "Item")}</th>
                        {ps.showQuantity && <th style={{ textAlign: "center", padding: "3px 0", fontWeight: 700 }}>{t("printThemes.quantity", "Qty")}</th>}
                        {ps.showPricePerUnit && <th style={{ textAlign: "right", padding: "3px 0", fontWeight: 700 }}>{t("printThemes.priceUnit", "Price")}</th>}
                        <th style={{ textAlign: "right", padding: "3px 0", fontWeight: 700 }}>{t("printThemes.total", "Total")}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={1 + (ps.showQuantity ? 1 : 0) + (ps.showPricePerUnit ? 1 : 0) + 1} style={{ padding: 0 }}>
                            <div style={{ borderTop: "1px solid #111", margin: "2px 0" }} />
                        </td>
                    </tr>
                    {records.map((r, idx) => {
                        const qtyWithUnit = ps.showUnit && r.unit ? `${r.quantity ?? ""}${r.unit}` : `${r.quantity ?? ""}`;
                        return (
                            <tr key={r.id ?? idx}>
                                <td style={{ padding: "3px 0", wordBreak: "break-word" }}>
                                    {r.itemName || r.item_name || ""}
                                </td>
                                {ps.showQuantity && <td style={{ padding: "3px 0", textAlign: "center" }}>{qtyWithUnit}</td>}
                                {ps.showPricePerUnit && (
                                    <td style={{ padding: "3px 0", textAlign: "right" }}>
                                        {fmt(Number(r.pricePerUnit ?? r.price_per_unit ?? 0))}
                                    </td>
                                )}
                                <td style={{ padding: "3px 0", textAlign: "right", fontWeight: 600 }}>
                                    {fmt(Number(r.amount || 0))}
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={1 + (ps.showQuantity ? 1 : 0) + (ps.showPricePerUnit ? 1 : 0) + 1} style={{ padding: 0 }}>
                            <div style={{ borderTop: "1px solid #111", margin: "2px 0" }} />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "3px 0", fontWeight: 600 }}>{t("printThemes.quantity", "Items")}</td>
                        {ps.showQuantity && ps.totalItemQuantity ? (
                            <td style={{ padding: "3px 0", textAlign: "center", fontWeight: 600 }}>
                                {totalQuantity}
                            </td>
                        ) : (
                            ps.showQuantity ? <td /> : null
                        )}
                        {ps.showPricePerUnit && <td colSpan={2} />}
                        {!ps.showPricePerUnit && <td />}
                    </tr>
                </tbody>
            </table>

            {/* ────────── SUMMARY ────────── */}
            <div style={{ marginTop: 4, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>{t("printThemes.subTotal", "Subtotal")}</span>
                    <span>{fmt(subTotal)}</span>
                </div>

                {ps.discount && discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>{t("printThemes.discount", "Discount")}{discountPercent != null ? ` (${discountPercent}%)` : ""}</span>
                        <span>-{fmt(discountAmount)}</span>
                    </div>
                )}

                {taxAmount > 0 && ps.taxDetails && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>{t("printThemes.tax", "Tax")} ({taxPercent}%)</span>
                        <span>{fmt(taxAmount)}</span>
                    </div>
                )}
            </div>

            {/* Boxed grand total — the one accent element in this design */}
            <div
                style={{
                    border: "2px solid #111",
                    padding: "6px 8px",
                    margin: "8px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    fontWeight: 800,
                }}
            >
                <span>{t("printThemes.total", "TOTAL")}</span>
                <span>{fmt(total)}</span>
            </div>

            <div style={{ fontSize: 12 }}>
                {ps.receivedAmount && documentTitle !== "Estimate" && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>{t("printThemes.received", "Received")}</span>
                        <span>{fmt(Number(received))}</span>
                    </div>
                )}
                {ps.balanceAmount && documentTitle !== "Estimate" && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontWeight: 700 }}>
                        <span>{t("printThemes.balance", "Balance Due")}</span>
                        <span>{fmt(balance)}</span>
                    </div>
                )}
                {ps.previousBalance && documentTitle !== "Estimate" && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#111" }}>
                        <span>{t("printThemes.previousBalance", "Previous Balance")}:</span>
                        <span>{fmt(prevBalance)}</span>
                    </div>
                )}
                {ps.currentBalanceOfParty && documentTitle !== "Estimate" && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontWeight: 700 }}>
                        <span>{t("printThemes.currBalance", "Curr. Balance")}</span>
                        <span>{fmt(currentBalance)}</span>
                    </div>
                )}
                {ps.paymentMode && paymentMode && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>{t("printThemes.payMode", "Pay. Mode")}</span>
                        <span>{paymentMode}</span>
                    </div>
                )}
                {youSaved > 0 && ps.youSaved && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontWeight: 600 }}>
                        <span>{t("printThemes.youSaved", "You Saved")}</span>
                        <span>{fmt(youSaved)}</span>
                    </div>
                )}
            </div>

            <SolidDivider />

            {/* ────────── FOOTER ────────── */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Thank you for your purchase!</div>
                {ps.printTermsAndConditions && (
                    <>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6 }}>{t("printThemes.termsAndConditions", "Terms & Conditions")}</div>
                        <div style={{ fontSize: 10, color: "#666", marginTop: 2, whiteSpace: "pre-wrap" }}>
                            {businessProfile?.terms_conditions}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ───────────────────────── useCompanyInfo ──────────────────────────── */

function useCompanyInfo() {
    const [info, setInfo] = useState({
        business_name: userProfile.businessName || "Laimsoft",
        phone: userProfile.phone,
        address: (userProfile as any).address as string | undefined,
        email: (userProfile as any).email as string | undefined,
        logo_url: userProfile.logo as string | undefined,
        terms_conditions: (userProfile as any).terms_conditions as string | undefined,
    });

    useEffect(() => {
        fetch("/api/user_profile")
            .then((r) => r.json())
            .then((d) => {
                if (d) {
                    setInfo({
                        business_name: d.business_name || userProfile.businessName || "Laimsoft",
                        phone: d.phone || "",
                        address: d.address || (userProfile as any).address,
                        email: d.email || (userProfile as any).email,
                        logo_url: d.logo_url || d.logo || userProfile.logo,
                        terms_conditions: d.terms_conditions || (userProfile as any).terms_conditions,
                    });
                }
            })
            .catch(() => { });
    }, []);

  
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setInfo(prev => ({ ...prev, ...detail }));
    };
    window.addEventListener("print-profile-draft", handler);
    return () => window.removeEventListener("print-profile-draft", handler);
  }, []);

  return info;
}

/* ───────────────────────── Preview export ──────────────────────────── */

export function ThermalTheme2Preview() {
    const company = useCompanyInfo();
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#f3f4f6",
                padding: "24px 0",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                    borderRadius: 4,
                    width: 380,
                    flexShrink: 0,
                }}
            >
                <ThermalSaleInvoiceClassic
                    records={DUMMY_RECORDS}
                    invoiceNo={6}
                    invoiceDate="2026-09-04"
                    customerName=""
                    customerPhone=""
                    businessProfile={company}
                    received={0}
                    discount={0}
                    taxPercent={0}
                    paymentMode="Credit"
                    previousBalance={800}
                />
            </div>
        </div>
    );
}