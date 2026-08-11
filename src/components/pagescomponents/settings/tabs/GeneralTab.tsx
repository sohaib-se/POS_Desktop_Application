import { ChevronDown, Clock, Search } from "lucide-react";
import { Hint } from "../shared/SharedComponents";
import { useState, useMemo } from "react";
// @ts-ignore
import { countries, currencies } from "country-data-list";

// Modern Card Wrapper
const Card = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      style={{
        background: "#ffffff",
        border: "1px solid",
        borderColor: isHovered ? "#cbd5e1" : "#e2e8f0",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: isHovered 
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" 
          : "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.3px" }}>{title}</h3>
      <div style={{ height: "1px", background: "#f1f5f9", margin: "0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
};

// Sleek Toggle Switch Row
const SettingToggleRow = ({ label, defaultChecked = false, hint = true }: { label: string, defaultChecked?: boolean, hint?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: isHovered ? "#f8fafc" : "transparent",
        border: "1px solid",
        borderColor: isHovered ? "#e2e8f0" : "transparent",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setChecked(!checked)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>{label}</span>
        {hint && <Hint />}
      </div>
      
      {/* iOS-style toggle */}
      <div 
        style={{
          width: "40px",
          height: "22px",
          background: checked ? "#3b82f6" : "#cbd5e1",
          borderRadius: "22px",
          position: "relative",
          transition: "background 0.3s ease",
        }}
      >
        <div style={{
          width: "18px",
          height: "18px",
          background: "#fff",
          borderRadius: "50%",
          position: "absolute",
          top: "2px",
          left: checked ? "20px" : "2px",
          transition: "left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
        }} />
      </div>
    </div>
  );
};

// Map npm package data to our format
const ALL_CURRENCIES = Object.values(currencies)
  .filter((c: any) => c.code && c.symbol && c.name)
  .map((currency: any) => {
    // Find the first country that uses this currency to get the flag
    const country = countries.all.find((c: any) => c.currencies && c.currencies.includes(currency.code) && c.emoji);
    return {
      code: currency.code,
      symbol: currency.symbol,
      name: currency.name,
      flag: country ? country.emoji : "🌐",
    };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

const DEFAULT_CURRENCY = ALL_CURRENCIES.find(c => c.code === "PKR") || ALL_CURRENCIES[0];

export function GeneralTab() {
  const [currencyHovered, setCurrencyHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return ALL_CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
        
        {/* Application Card */}
        <Card title="Application">
          <SettingToggleRow label="Enable Passcode" />
          
          {/* Business Currency Row - Custom layout for dropdown */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: currencyHovered || dropdownOpen ? "#f8fafc" : "transparent",
              border: "1px solid",
              borderColor: currencyHovered || dropdownOpen ? "#e2e8f0" : "transparent",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={() => setCurrencyHovered(true)}
            onMouseLeave={() => setCurrencyHovered(false)}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>Business Currency</span>
              <Hint />
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "6px 12px",
              borderRadius: "8px",
              color: "#1d4ed8",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}>
              <span style={{ fontSize: "14px", lineHeight: 1 }}>{selectedCurrency.flag}</span>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>{selectedCurrency.symbol}</span>
              <ChevronDown size={14} style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
            </div>

            {/* Currency Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Transparent overlay to close dropdown on outside click */}
                <div 
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    setSearchQuery(""); // Reset search on close
                  }}
                />
                <div 
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: "0",
                    width: "280px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    zIndex: 50,
                    padding: "8px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent bubbling to the row wrapper
                >
                  <div style={{ position: "relative", marginBottom: "8px" }}>
                    <Search size={14} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search currency..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px 8px 32px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        outline: "none",
                        fontSize: "13px",
                        color: "#334155",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div style={{ overflowY: "auto", maxHeight: "280px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map(currency => (
                        <div
                          key={currency.code}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: selectedCurrency.code === currency.code ? "#eff6ff" : "transparent",
                            transition: "background 0.15s ease",
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            if (selectedCurrency.code !== currency.code) e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (selectedCurrency.code !== currency.code) e.currentTarget.style.background = "transparent";
                          }}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setDropdownOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "16px", lineHeight: 1 }}>{currency.flag}</span>
                            <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>{currency.code}</span>
                            <span style={{ fontSize: "12px", color: "#64748b", maxWidth: "100px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currency.name}</span>
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1d4ed8" }}>{currency.symbol}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        No currencies found
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <SettingToggleRow label="Stop Sale on Negative Stock" />
        </Card>

        {/* Backup & History Card */}
        <Card title="Backup & History">
          <SettingToggleRow label="Auto Backup" />
          
          <div style={{ 
            marginTop: "6px",
            padding: "12px 16px",
            background: "#fefce8",
            border: "1px solid #fef08a",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#a16207",
            fontSize: "13px",
            fontWeight: 500
          }}>
            <Clock size={16} className="text-amber-600" />
            <span>Last Backup: 23/04/2026 | 10:04 PM</span>
          </div>
        </Card>

        {/* More Transactions Card */}
        <Card title="More Transactions">
          <SettingToggleRow label="Estimate/Quotation" defaultChecked={true} />
        </Card>

      </div>
    </div>
  );
}
