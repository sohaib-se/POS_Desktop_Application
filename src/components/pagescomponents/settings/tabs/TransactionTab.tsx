import { Card, SettingToggleRow } from "../shared/SharedComponents";
import { selStyle, inputStyle, nudgeBtn } from "../shared/styles";
import { useSettings } from "../../../../hooks/useSettings";
import { useTranslation } from "react-i18next";

export function TransactionTab() {
  const { t } = useTranslation();
  const [isTransactionTaxEnabled, setIsTransactionTaxEnabled] = useSettings('settings.isTransactionTaxEnabled', true);
  const [isTransactionDiscountEnabled, setIsTransactionDiscountEnabled] = useSettings('settings.isTransactionDiscountEnabled', true);
  const [isRoundOffTotalEnabled, setIsRoundOffTotalEnabled] = useSettings('settings.isRoundOffTotalEnabled', true);
  const [isCashSaleByDefault, setIsCashSaleByDefault] = useSettings('settings.isCashSaleByDefault', false);
  const [isBarcodeScanEnabled, setIsBarcodeScanEnabled] = useSettings('settings.isBarcodeScanEnabled', false);

  const [isDoNotShowInvoicePreviewEnabled, setIsDoNotShowInvoicePreviewEnabled] = useSettings('settings.isDoNotShowInvoicePreviewEnabled', false);
  const [isDisablePrintEnabled, setIsDisablePrintEnabled] = useSettings('settings.isDisablePrintEnabled', false);
  const [roundOffLimit, setRoundOffLimit] = useSettings('settings.roundOffLimit', 1);

  return (
    <div style={{ 
      padding: "32px", 
      background: "#f8fafc", 
      minHeight: "100%",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "24px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        

        {/* Taxes, Discount & Totals Card */}
        <Card title={t("settings.transactions.taxesDiscountTotals")}>
          <SettingToggleRow 
            label={t("settings.transactions.transactionWiseTax")} 
            checked={isTransactionTaxEnabled} 
            onChange={setIsTransactionTaxEnabled} 
          />
          <SettingToggleRow 
            label={t("settings.transactions.transactionWiseDiscount")} 
            checked={isTransactionDiscountEnabled} 
            onChange={setIsTransactionDiscountEnabled} 
          />
          <SettingToggleRow 
            label={t("settings.transactions.roundOffTotal")} 
            checked={isRoundOffTotalEnabled} 
            onChange={setIsRoundOffTotalEnabled} 
          />
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <select style={{ ...selStyle, padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc", flex: 1, marginRight: "12px" }}>
              <option>{t("settings.transactions.nearest")}</option>
              <option>{t("settings.transactions.roundUp")}</option>
              <option>{t("settings.transactions.roundDown")}</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{t("settings.transactions.to")}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff"
                }}
              >
                <input
                  type="number"
                  min={0}
                  value={roundOffLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setRoundOffLimit(val);
                    } else if (e.target.value === "") {
                      setRoundOffLimit(0);
                    }
                  }}
                  style={{
                    ...inputStyle,
                    width: "44px",
                    border: "none",
                    borderRadius: 0,
                    textAlign: "center",
                    fontWeight: 600,
                    padding: "4px"
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: "1px solid #cbd5e1",
                    background: "#f8fafc"
                  }}
                >
                  <button 
                    type="button"
                    onClick={() => setRoundOffLimit(prev => prev + 1)}
                    style={{ ...nudgeBtn, padding: "2px 6px" }}
                  >
                    ▲
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRoundOffLimit(prev => Math.max(0, prev - 1))}
                    style={{ ...nudgeBtn, padding: "2px 6px", borderTop: "1px solid #cbd5e1" }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* More Transaction Features Card */}
        <Card title={t("settings.transactions.moreTransactionFeatures")}>
          <SettingToggleRow 
            label={t("settings.transactions.cashSaleByDefault")} 
            checked={isCashSaleByDefault} 
            onChange={setIsCashSaleByDefault} 
          />
          <SettingToggleRow label={t("settings.transactions.barcodeScan")} hint={true} checked={isBarcodeScanEnabled} onChange={setIsBarcodeScanEnabled} />
          <SettingToggleRow 
            label={t("settings.transactions.doNotShowInvoicePreview")} 
            checked={isDoNotShowInvoicePreviewEnabled} 
            onChange={setIsDoNotShowInvoicePreviewEnabled} 
          />
          <SettingToggleRow 
            label={t("settings.transactions.disablePrint")} 
            checked={isDisablePrintEnabled} 
            onChange={setIsDisablePrintEnabled} 
          />

        </Card>

      </div>
    </div>
  );
}
