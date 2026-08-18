import { Card, SettingToggleRow } from "../shared/SharedComponents";
import { selStyle, inputStyle, nudgeBtn } from "../shared/styles";
import { useSettings } from "../../../../hooks/useSettings";

export function TransactionTab() {
  const [isTransactionTaxEnabled, setIsTransactionTaxEnabled] = useSettings('settings.isTransactionTaxEnabled', true);
  const [isTransactionDiscountEnabled, setIsTransactionDiscountEnabled] = useSettings('settings.isTransactionDiscountEnabled', true);
  const [isRoundOffTotalEnabled, setIsRoundOffTotalEnabled] = useSettings('settings.isRoundOffTotalEnabled', true);
  const [isCashSaleByDefault, setIsCashSaleByDefault] = useSettings('settings.isCashSaleByDefault', false);
  const [isPasscodeForTransactionEnabled, setIsPasscodeForTransactionEnabled] = useSettings('settings.isPasscodeForTransactionEnabled', false);

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
        <Card title="Taxes, Discount & Totals">
          <SettingToggleRow 
            label="Transaction wise Tax" 
            checked={isTransactionTaxEnabled} 
            onChange={setIsTransactionTaxEnabled} 
          />
          <SettingToggleRow 
            label="Transaction wise Discount" 
            checked={isTransactionDiscountEnabled} 
            onChange={setIsTransactionDiscountEnabled} 
          />
          <SettingToggleRow 
            label="Round Off Total" 
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
              <option>Nearest</option>
              <option>Round Up</option>
              <option>Round Down</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>To</span>
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
                  defaultValue={1}
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
                  <button style={{ ...nudgeBtn, padding: "2px 6px" }}>▲</button>
                  <button style={{ ...nudgeBtn, padding: "2px 6px", borderTop: "1px solid #cbd5e1" }}>
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* More Transaction Features Card */}
        <Card title="More Transaction Features">
          <SettingToggleRow 
            label="Cash Sale by default" 
            checked={isCashSaleByDefault} 
            onChange={setIsCashSaleByDefault} 
          />
          <SettingToggleRow label="Barcode Scan" hint={true} />
          <SettingToggleRow label="Do not Show Invoice Preview" />
          <SettingToggleRow 
            label={
              <span>
                Enable <span style={{ color: "#2563eb", fontWeight: 600 }}>Passcode</span> for <span style={{ color: "#2563eb", fontWeight: 600 }}>transaction</span> edit/delete
              </span>
            } 
            checked={isPasscodeForTransactionEnabled}
            onChange={setIsPasscodeForTransactionEnabled}
          />
        </Card>

      </div>
    </div>
  );
}
