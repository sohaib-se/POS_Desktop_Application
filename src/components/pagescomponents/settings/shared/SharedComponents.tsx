import type React from "react";
import { Info, ChevronDown } from "lucide-react";
import { useState } from "react";
import { inputStyle } from "./styles";

export function Hint() {
  return (
    <Info
      size={12}
      style={{
        display: "inline",
        verticalAlign: "middle",
        color: "#9ca3af",
        marginLeft: 3,
        flexShrink: 0,
      }}
    />
  );
}

// Modern Card Wrapper
export const Card = ({ title, children }: { title: string, children: React.ReactNode }) => {
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
export const SettingToggleRow = ({ 
  label, 
  checked,
  onChange,
  defaultChecked = false, 
  hint = true 
}: { 
  label: React.ReactNode,
  checked?: boolean,
  onChange?: (val: boolean) => void,
  defaultChecked?: boolean, 
  hint?: boolean 
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isHovered, setIsHovered] = useState(false);

  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleClick = () => {
    if (onChange) {
      onChange(!isChecked);
    } else {
      setInternalChecked(!internalChecked);
    }
  };

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
      onClick={handleClick}
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
          background: isChecked ? "#3b82f6" : "#cbd5e1",
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
          left: isChecked ? "20px" : "2px",
          transition: "left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
        }} />
      </div>
    </div>
  );
};

export function CheckRow({
  label,
  hint = false,
  defaultChecked = false,
  checked,
  onChange,
  labelStyle,
  extra,
}: {
  label: React.ReactNode;
  hint?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  labelStyle?: React.CSSProperties;
  extra?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 14,
      }}
    >
      <input
        type="checkbox"
        defaultChecked={checked !== undefined ? undefined : defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        style={{
          accentColor: "#2563eb",
          width: 15,
          height: 15,
          flexShrink: 0,
          cursor: "pointer",
        }}
      />
      <span style={{ fontSize: 13, color: "#374151", ...labelStyle }}>
        {label}
        {hint && <Hint />}
      </span>
      {extra}
    </div>
  );
}

export function ToggleRow({
  label,
  hint = false,
  defaultChecked = false,
  sub,
}: {
  label: string;
  hint?: boolean;
  defaultChecked?: boolean;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 8,
      }}
    >
      <div>
        <span style={{ fontSize: 13, color: "#374151" }}>
          {label}
          {hint && <Hint />}
        </span>
        {sub && (
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        style={{
          accentColor: "#2563eb",
          width: 15,
          height: 15,
          flexShrink: 0,
          cursor: "pointer",
          marginTop: 2,
        }}
      />
    </div>
  );
}

export function RadioRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: checked ? "2px solid #2563eb" : "2px solid #9ca3af",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        {checked && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#2563eb",
            }}
          />
        )}
      </div>
      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
    </div>
  );
}

export function PrefixField({ label }: { label: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#2563eb", marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <select
          style={{
            flex: 1,
            border: "none",
            padding: "5px 8px",
            fontSize: 12,
            color: "#374151",
            outline: "none",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option>None</option>
        </select>
        <ChevronDown
          size={12}
          color="#6b7280"
          style={{ marginRight: 6, flexShrink: 0 }}
        />
      </div>
    </div>
  );
}

export function ToggleField() {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 23 }}
    >
      <div
        style={{
          width: 34,
          height: 18,
          borderRadius: 9,
          background: "#d1d5db",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>Show In Print</span>
    </div>
  );
}

export function AdditionalFieldRow({ placeholder }: { placeholder: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          style={{
            accentColor: "#2563eb",
            width: 15,
            height: 15,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
      </div>
      <ToggleField />
    </div>
  );
}
