import { useState, useEffect } from "react";
import { BLUE, BORDER, TEXT_MUTED, TEXT_LABEL, TEXT_DARK } from "./constants";

export function EditableText({ textKey, defaultText }: { textKey: string, defaultText: string }) {
  const [val, setVal] = useState(() => localStorage.getItem(`print_${textKey}`) || defaultText);

  useEffect(() => {
    const handleUpdate = () => {
      setVal(localStorage.getItem(`print_${textKey}`) || defaultText);
    };
    window.addEventListener("company-details-update", handleUpdate);
    return () => window.removeEventListener("company-details-update", handleUpdate);
  }, [textKey, defaultText]);

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newVal = e.currentTarget.textContent || "";
    localStorage.setItem(`print_${textKey}`, newVal);
    window.dispatchEvent(new Event("company-details-update"));
  };

  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{ cursor: "text", outline: "none" }}
    >
      {val}
    </span>
  );
}

export function InfoIcon() {
  return (
    <span
      title="More info"
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: `1px solid ${TEXT_MUTED}`,
        color: TEXT_MUTED,
        fontSize: 9,
        fontStyle: "italic",
        fontFamily: "Georgia, serif",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "default",
        marginLeft: 8 }}
    >
      i
    </span>
  );
}

/** Plain checkbox + label + trailing info icon */
export function InfoCheckRow({
  label,
  defaultChecked,
  trailing }: {
  label: string;
  defaultChecked?: boolean;
  trailing?: React.ReactNode;
}) {
  const [checked, setChecked] = useState(!!defaultChecked);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12 }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        style={{
          accentColor: BLUE,
          width: 15,
          height: 15,
          cursor: "pointer",
          flexShrink: 0 }}
      />
      <span style={{ fontSize: 13, color: TEXT_LABEL, marginLeft: 8 }}>
        {label}
      </span>
      {trailing}
      <InfoIcon />
    </div>
  );
}

/** Checkbox + floating-label bordered text field + info icon (Company Name, Address, Email...) */
export function InfoFieldRow({
  label,
  defaultValue = "",
  value,
  onChange,
  checked: externalChecked,
  onCheckedChange,
  placeholder,
  defaultChecked = true,
  readOnly = true }: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  checked?: boolean;
  onCheckedChange?: (val: boolean) => void;
  placeholder?: string;
  defaultChecked?: boolean;
  readOnly?: boolean;
}) {
  const [localChecked, setLocalChecked] = useState(defaultChecked);
  const currentChecked = externalChecked !== undefined ? externalChecked : localChecked;

  const handleCheckChange = (c: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(c);
    } else {
      setLocalChecked(c);
    }
  };

  const [localVal, setLocalVal] = useState(defaultValue);
  const currentVal = value !== undefined ? value : localVal;

  const handleInputChange = (val: string) => {
    if (onChange) {
      onChange(val);
    } else {
      setLocalVal(val);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: 14,
        gap: 8 }}
    >
      <input
        type="checkbox"
        checked={currentChecked}
        onChange={(e) => handleCheckChange(e.target.checked)}
        style={{
          accentColor: BLUE,
          width: 15,
          height: 15,
          cursor: "pointer",
          marginTop: 10,
          flexShrink: 0 }}
      />
      <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
        <span
          style={{
            position: "absolute",
            top: -7,
            left: 10,
            background: "#f8fafc",
            padding: "0 4px",
            fontSize: 10,
            color: TEXT_MUTED }}
        >
          {label}
        </span>
        <input
          type="text"
          value={currentVal}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={!currentChecked}
          readOnly={readOnly}
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "10px 10px 6px",
            fontSize: 13,
            color: TEXT_DARK,
            outline: "none",
            background: currentChecked && !readOnly ? "#fff" : "#f3f4f6" }}
        />
      </div>
      <InfoIcon />
    </div>
  );
}

/** Checkbox + label + info icon (Company Logo row) */
export function InfoLogoRow({ 
  checked: externalChecked,
  onCheckedChange,
  defaultChecked = true 
}: { 
  checked?: boolean;
  onCheckedChange?: (val: boolean) => void;
  defaultChecked?: boolean;
}) {
  const [localChecked, setLocalChecked] = useState(defaultChecked);
  const currentChecked = externalChecked !== undefined ? externalChecked : localChecked;

  const handleCheckChange = (c: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(c);
    } else {
      setLocalChecked(c);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
      <input
        type="checkbox"
        checked={currentChecked}
        onChange={(e) => handleCheckChange(e.target.checked)}
        style={{ accentColor: BLUE, width: 15, height: 15, cursor: "pointer" }}
      />
      <span style={{ fontSize: 13, color: TEXT_LABEL, marginLeft: 8 }}>
        Company Logo
      </span>
      <InfoIcon />
    </div>
  );
}

/** Label above a <select>, with trailing info icon (Paper Size, Orientation...) */
export function LabeledSelect({
  label,
  options,
  defaultValue }: {
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0]);
  return (
    <div style={{ marginBottom: 16, maxWidth: 320 }}>
      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            flex: 1,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
            color: TEXT_DARK,
            background: "#fff",
            outline: "none" }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <InfoIcon />
      </div>
    </div>
  );
}

/** Label above a small number <input>, with trailing info icon */
export function LabeledNumber({
  label,
  defaultValue }: {
  label: string;
  defaultValue: number;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div style={{ marginBottom: 16, maxWidth: 200 }}>
      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{
            flex: 1,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
            color: TEXT_DARK,
            outline: "none" }}
        />
        <InfoIcon />
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: TEXT_DARK,
        marginBottom: 12 }}
    >
      {children}
    </div>
  );
}

export function Divider() {
  return (
    <div
      style={{
        borderTop: `1px solid ${BORDER}`,
        margin: "16px 0" }}
    />
  );
}
