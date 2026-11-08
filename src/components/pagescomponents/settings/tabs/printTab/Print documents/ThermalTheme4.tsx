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

interface ThermalTheme4Props {
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

/* ──────────────────── formatDate / formatTime ────────────────────────── */

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

/* ─────────── ThermalSaleInvoiceRetail — plain industry-standard look ───
   Same building blocks as the reference Theme 3 file — flex rows for
   meta/summary lines, a real <table> for items, border-based rules —
   so it renders reliably at any width or font-substitution outcome.
   No color anywhere: pure black ink on white, ALL-CAPS labels, dashed/
   solid rules. This is the plain look nearly every retail register
   actually prints.
*/

export function ThermalSaleInvoiceRetail({
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
}: ThermalTheme4Props) {
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
    const businessName = (businessProfile?.business_name || "Laimsoft").toUpperCase();

    /* Shared row style — flex space-between, monospace font */
    const row: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        lineHeight: 1.7,
        fontSize: 12,
    };
    const rule = (char: "-" | "=") => (
        <div
            style={{
                borderTop: char === "=" ? "2px solid #000" : "1px dashed #555",
                margin: "5px 0",
            }}
        />
    );
    const starRule = () => (
        <div
            style={{
                textAlign: "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
                margin: "6px 0",
                letterSpacing: 2,
            }}
        >
            {"*".repeat(48)}
        </div>
    );

    return (
        <div
            className="thermal-receipt"
            style={{
                background: "#fff",
                color: "#000",
                fontFamily: "'Courier New', Courier, Consolas, monospace",
                width: "100%",
                maxWidth: 380,
                margin: "0 auto",
                padding: "16px 14px 24px",
                boxSizing: "border-box",
                fontSize: 12,
            }}
        >
            {/* ── HEADER ── */}
            <div style={{ textAlign: "center", marginBottom: 6 }}>
                {businessName ? <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1 }}>{businessName}</div> : null}
                {businessProfile?.address && (
                    <div style={{ fontSize: 11 }}>{businessProfile.address}</div>
                )}
                {businessProfile?.phone && (
                    <div style={{ fontSize: 11 }}>TEL: {businessProfile.phone}</div>
                )}
                {businessProfile?.email && (
                    <div style={{ fontSize: 11 }}>{t("printThemes.email", "Email")}: {businessProfile.email}</div>
                )}
            </div>

            {rule("-")}
            <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700 }}>
                {documentTitle && documentTitle !== "Invoice" ? documentTitle.toUpperCase() : t("printThemes.invoice", "Sales Receipt").toUpperCase()}
            </div>
            {rule("-")}

            {/* ── META ── */}
            <div style={row}><span>{documentTitle && documentTitle !== "Invoice" ? `${documentTitle.toUpperCase()}#:` : `${t("printThemes.invoiceNo", "Receipt").toUpperCase()}#:`}</span><span>{invoiceNo}</span></div>
            <div style={row}><span>{t("printThemes.date", "Date").toUpperCase()}:</span><span>{formatDate(invoiceDate)} {formatTime(invoiceDate)}</span></div>
            <div style={row}><span>{t("common.customer", "Customer").toUpperCase()}:</span><span>{customerName || ""}</span></div>
            {customerPhone && <div style={row}><span>{t("printThemes.phoneNo", "Phone").toUpperCase()}:</span><span>{customerPhone}</span></div>}

            {rule("=")}

            {/* ── ITEMS ── */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "inherit" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", fontWeight: 700, padding: "2px 0" }}>{t("printThemes.itemName", "Item").toUpperCase()}</th>
                        {ps.showQuantity && <th style={{ textAlign: "center", fontWeight: 700, padding: "2px 0" }}>{t("printThemes.quantity", "Qty").toUpperCase()}</th>}
                        {ps.showPricePerUnit && <th style={{ textAlign: "right", fontWeight: 700, padding: "2px 0" }}>{t("printThemes.priceUnit", "Price").toUpperCase()}</th>}
                        <th style={{ textAlign: "right", fontWeight: 700, padding: "2px 0" }}>{t("printThemes.total", "Total").toUpperCase()}</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r, idx) => {
                        const qtyWithUnit = ps.showUnit && r.unit ? `${r.quantity ?? ""}${r.unit}` : `${r.quantity ?? ""}`;
                        return (
                            <tr key={r.id ?? idx}>
                                <td style={{ padding: "2px 0", wordBreak: "break-word" }}>
                                    {(r.itemName || r.item_name || "").toUpperCase()}
                                </td>
                                {ps.showQuantity && <td style={{ padding: "2px 0", textAlign: "center" }}>{qtyWithUnit}</td>}
                                {ps.showPricePerUnit && (
                                    <td style={{ padding: "2px 0", textAlign: "right" }}>
                                        {fmt(Number(r.pricePerUnit ?? r.price_per_unit ?? 0))}
                                    </td>
                                )}
                                <td style={{ padding: "2px 0", textAlign: "right", fontWeight: 700 }}>
                                    {fmt(Number(r.amount || 0))}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {rule("-")}

            {ps.totalItemQuantity && <div style={row}><span>{t("printThemes.quantity", "Total Qty").toUpperCase()}</span><span>{totalQuantity}</span></div>}
            <div style={row}><span>{t("printThemes.subTotal", "Subtotal").toUpperCase()}</span><span>{fmt(subTotal)}</span></div>

            {ps.discount && discountAmount > 0 && (
                <div style={row}>
                    <span>{t("printThemes.discount", "Discount").toUpperCase()}{discountPercent != null ? `(${discountPercent}%)` : ""}</span>
                    <span>-{fmt(discountAmount)}</span>
                </div>
            )}

            {ps.taxDetails && taxAmount > 0 && (
                <div style={row}>
                    <span>{t("printThemes.tax", "Tax").toUpperCase()} ({taxPercent}%)</span>
                    <span>{fmt(taxAmount)}</span>
                </div>
            )}

            {rule("=")}

            <div style={{ ...row, fontSize: 16, fontWeight: 800, margin: "2px 0" }}>
                <span>{t("printThemes.total", "Total").toUpperCase()}</span>
                <span>{fmt(total)}</span>
            </div>

            {rule("=")}

            {ps.receivedAmount && documentTitle !== "Estimate" && <div style={row}><span>{t("printThemes.received", "Received").toUpperCase()}:</span><span>{fmt(Number(received))}</span></div>}
            {ps.balanceAmount && documentTitle !== "Estimate" && (
                <div style={{ ...row, fontWeight: 700 }}>
                    <span>{t("printThemes.balance", "Balance").toUpperCase()}:</span>
                    <span>{fmt(balance)}</span>
                </div>
            )}
            {ps.previousBalance && documentTitle !== "Estimate" && (
                <div style={row}><span>{t("printThemes.prevBalance", "Prev. Balance").toUpperCase()}:</span><span>{fmt(prevBalance)}</span></div>
            )}
            {ps.currentBalanceOfParty && documentTitle !== "Estimate" && <div style={{ ...row, fontWeight: 700 }}><span>{t("printThemes.currBalance", "Curr. Balance").toUpperCase()}:</span><span>{fmt(currentBalance)}</span></div>}
            {ps.paymentMode && paymentMode && (
                <div style={row}><span>{t("printThemes.payMode", "Pay. Mode").toUpperCase()}:</span><span>{paymentMode}</span></div>
            )}

            {youSaved > 0 && ps.youSaved && (
                <>
                    {rule("-")}
                    <div style={row}><span>{t("printThemes.youSaved", "You Saved").toUpperCase()}</span><span>{fmt(youSaved)}</span></div>
                </>
            )}

            {starRule()}

            {/* ── FOOTER ── */}
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>THANK YOU</div>
                {ps.printTermsAndConditions && (
                    <>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{t("printThemes.termsAndConditions", "Terms & Conditions")}</div>
                        <div style={{ fontSize: 10, marginTop: 1, whiteSpace: "pre-wrap" }}>{businessProfile?.terms_conditions}</div>
                    </>
                )}
            </div>

            {starRule()}
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

export function ThermalTheme4Preview() {
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
                <ThermalSaleInvoiceRetail
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