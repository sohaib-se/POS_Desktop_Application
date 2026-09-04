import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { userProfile } from "@/data/mockData";

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
    businessProfile?: { business_name?: string; phone?: string; address?: string; logo_url?: string };
    received?: number;
    discount?: number;
    discountPercent?: number;
    taxPercent?: number;
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
            {(businessName || "M").charAt(0).toUpperCase()}
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
}: ThermalTheme2Props) {
    const [currency] = useSettings("settings.businessCurrency", { code: "PKR", symbol: "Rs" });
    const [currencyDisplay] = useSettings<"abbreviation" | "icon">(
        "settings.currencyDisplay",
        "abbreviation"
    );
    void currencyDisplay;
    void currency;

    const totalQuantity = records.reduce((s, r) => s + Number(r.quantity || 0), 0);
    const subTotal = records.reduce((s, r) => s + Number(r.amount || 0), 0);
    const taxAmount = (subTotal - Number(discount)) * (Number(taxPercent) / 100);
    const total = subTotal - Number(discount) + taxAmount;
    const balance = total - Number(received);

    const fmt = (n: number) => n.toFixed(2);

    return (
        <div
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
                    {businessProfile?.business_name || "My Company"}
                </div>
                {businessProfile?.address && (
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                        {businessProfile.address}
                    </div>
                )}
                {businessProfile?.phone && (
                    <div style={{ fontSize: 11, color: "#444" }}>{businessProfile.phone}</div>
                )}
            </div>

            <SolidDivider thick />

            {/* ────────── META ROW ────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#333" }}>
                <div>
                    <div>Receipt #{invoiceNo}</div>
                    <div>{formatDate(invoiceDate)} {formatTime(invoiceDate)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#111" }}>{customerName}</div>
                    {customerPhone && <div>{customerPhone}</div>}
                </div>
            </div>

            <SolidDivider />

            {/* ────────── ITEMS TABLE ────────── */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", padding: "3px 0", fontWeight: 700 }}>Item</th>
                        <th style={{ textAlign: "center", padding: "3px 0", fontWeight: 700 }}>Qty</th>
                        <th style={{ textAlign: "right", padding: "3px 0", fontWeight: 700 }}>Price</th>
                        <th style={{ textAlign: "right", padding: "3px 0", fontWeight: 700 }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={4} style={{ padding: 0 }}>
                            <div style={{ borderTop: "1px solid #111", margin: "2px 0" }} />
                        </td>
                    </tr>
                    {records.map((r, idx) => {
                        const qtyWithUnit = r.unit ? `${r.quantity ?? ""}${r.unit}` : `${r.quantity ?? ""}`;
                        return (
                            <tr key={r.id ?? idx}>
                                <td style={{ padding: "3px 0", wordBreak: "break-word" }}>
                                    {r.itemName || r.item_name || ""}
                                </td>
                                <td style={{ padding: "3px 0", textAlign: "center" }}>{qtyWithUnit}</td>
                                <td style={{ padding: "3px 0", textAlign: "right" }}>
                                    {fmt(Number(r.pricePerUnit ?? r.price_per_unit ?? 0))}
                                </td>
                                <td style={{ padding: "3px 0", textAlign: "right", fontWeight: 600 }}>
                                    {fmt(Number(r.amount || 0))}
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={4} style={{ padding: 0 }}>
                            <div style={{ borderTop: "1px solid #111", margin: "2px 0" }} />
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "3px 0", fontWeight: 600 }}>Items</td>
                        <td style={{ padding: "3px 0", textAlign: "center", fontWeight: 600 }}>
                            {totalQuantity}
                        </td>
                        <td colSpan={2} />
                    </tr>
                </tbody>
            </table>

            {/* ────────── SUMMARY ────────── */}
            <div style={{ marginTop: 4, fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>Subtotal</span>
                    <span>{fmt(subTotal)}</span>
                </div>

                {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>Discount{discountPercent != null ? ` (${discountPercent}%)` : ""}</span>
                        <span>-{fmt(Number(discount))}</span>
                    </div>
                )}

                {taxPercent > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>Tax ({taxPercent}%)</span>
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
                <span>TOTAL</span>
                <span>{fmt(total)}</span>
            </div>

            <div style={{ fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span>Received</span>
                    <span>{fmt(Number(received))}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontWeight: 700 }}>
                    <span>Balance Due</span>
                    <span>{fmt(balance)}</span>
                </div>
            </div>

            <SolidDivider />

            {/* ────────── FOOTER ────────── */}
            <div style={{ textAlign: "center", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Thank you for your purchase!</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
                    Please keep this receipt for returns &amp; exchanges
                </div>
            </div>
        </div>
    );
}

/* ───────────────────────── useCompanyInfo ──────────────────────────── */

function useCompanyInfo() {
    const [info, setInfo] = useState({
        business_name: userProfile.businessName,
        phone: userProfile.phone,
        address: (userProfile as any).address as string | undefined,
        logo_url: userProfile.logo as string | undefined,
    });

    useEffect(() => {
        fetch("/api/user_profile")
            .then((r) => r.json())
            .then((d) => {
                if (d) {
                    setInfo({
                        business_name: d.business_name || userProfile.businessName,
                        phone: d.phone || userProfile.phone,
                        address: d.address || (userProfile as any).address,
                        logo_url: d.logo_url || d.logo || userProfile.logo,
                    });
                }
            })
            .catch(() => { });
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
                    customerName="Zeeshan"
                    customerPhone="03129955494"
                    businessProfile={company}
                    received={50}
                    discount={50}
                    discountPercent={50}
                    taxPercent={0}
                />
            </div>
        </div>
    );
}