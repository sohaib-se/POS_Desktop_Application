import { useState, useEffect, useRef, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { BLUE, BORDER, TEXT_MUTED, TEXT_LABEL, TEXT_DARK } from "./constants";

export const PrintPreviewContext = createContext({ isReadOnly: false });

export function EditableText({ textKey, defaultText }: { textKey: string, defaultText: string }) {
  const [val, setVal] = useState(() => localStorage.getItem(`print_lbl_v2_${textKey}`) || defaultText);
  const { isReadOnly } = useContext(PrintPreviewContext);

  useEffect(() => {
    const handleUpdate = () => {
      setVal(localStorage.getItem(`print_lbl_v2_${textKey}`) || defaultText);
    };
    window.addEventListener("company-details-update", handleUpdate);
    return () => window.removeEventListener("company-details-update", handleUpdate);
  }, [textKey, defaultText]);

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (isReadOnly) return;
    const newVal = e.currentTarget.textContent || "";
    localStorage.setItem(`print_lbl_v2_${textKey}`, newVal);
    window.dispatchEvent(new Event("company-details-update"));
  };

  return (
    <span
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{ cursor: isReadOnly ? "default" : "text", outline: "none" }}
    >
      {val}
    </span>
  );
}

export function TooltipContent({ title, questions }: { title: string, questions: { q: string, a: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
      {questions.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ color: "#a1a1aa", fontSize: 11, fontWeight: 500 }}>{item.q}</div>
          <div style={{ fontSize: 11, color: "#e4e4e7" }}>{item.a}</div>
        </div>
      ))}
    </div>
  );
}

export function InfoIcon({ tooltip }: { tooltip?: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
    }
    setIsMounted(true);
    // Short delay to allow DOM render before toggling opacity/transform for CSS transition
    setTimeout(() => setIsVisible(true), 10);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    timerRef.current = setTimeout(() => {
      setIsMounted(false);
    }, 200); // Wait for transition duration before unmounting
  };

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={!tooltip ? "More info" : undefined}
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `1px solid ${isVisible ? BLUE : TEXT_MUTED}`,
          color: isVisible ? BLUE : TEXT_MUTED,
          backgroundColor: isVisible ? `${BLUE}1a` : "transparent",
          fontSize: 9,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "default",
          marginLeft: 8,
          transform: `scale(${isVisible ? 1.1 : 1})`,
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        i
      </span>
      {isMounted && tooltip && createPortal(
        <div style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: `translateY(-50%) scale(${isVisible ? 1 : 0.95})`,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          background: "#2d2d2d",
          color: "#fff",
          padding: "12px",
          borderRadius: "6px",
          width: "max-content",
          maxWidth: "280px",
          zIndex: 999999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: 12,
          lineHeight: 1.4,
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "left",
          pointerEvents: "none"
        }}>
          {tooltip}
          <div style={{
            position: "absolute",
            top: "50%",
            right: "100%",
            transform: "translateY(-50%)",
            borderWidth: 5,
            borderStyle: "solid",
            borderColor: "transparent #2d2d2d transparent transparent"
          }} />
        </div>,
        document.body
      )}
    </>
  );
}

/** Plain checkbox + label + trailing info icon */
export function InfoCheckRow({
  label,
  defaultChecked,
  checked: externalChecked,
  onCheckedChange,
  trailing,
  tooltip }: {
    label: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onCheckedChange?: (val: boolean) => void;
    trailing?: React.ReactNode;
    tooltip?: React.ReactNode;
  }) {
  const [localChecked, setLocalChecked] = useState(!!defaultChecked);
  const currentChecked = externalChecked !== undefined ? externalChecked : localChecked;

  const handleCheckChange = (c: boolean) => {
    if (onCheckedChange) {
      onCheckedChange(c);
    } else {
      setLocalChecked(c);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 12
      }}
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
          flexShrink: 0
        }}
      />
      <span style={{ fontSize: 13, color: TEXT_LABEL, marginLeft: 8 }}>
        {label}
      </span>
      {trailing}
      <InfoIcon tooltip={tooltip} />
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
  readOnly = true,
  tooltip }: {
    label: string;
    defaultValue?: string;
    value?: string;
    onChange?: (val: string) => void;
    checked?: boolean;
    onCheckedChange?: (val: boolean) => void;
    placeholder?: string;
    defaultChecked?: boolean;
    readOnly?: boolean;
    tooltip?: React.ReactNode;
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
        gap: 8
      }}
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
          flexShrink: 0
        }}
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
            color: TEXT_MUTED
          }}
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
            background: currentChecked && !readOnly ? "#fff" : "#f3f4f6"
          }}
        />
      </div>
      <InfoIcon tooltip={tooltip} />
    </div>
  );
}

/** Checkbox + label + info icon (Company Logo row) */
export function InfoLogoRow({
  checked: externalChecked,
  onCheckedChange,
  defaultChecked = true,
  tooltip
}: {
  checked?: boolean;
  onCheckedChange?: (val: boolean) => void;
  defaultChecked?: boolean;
  tooltip?: React.ReactNode;
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
      <InfoIcon tooltip={tooltip} />
    </div>
  );
}

/** Label above a <select>, with trailing info icon (Paper Size, Orientation...) */
export function LabeledSelect({
  label,
  options,
  defaultValue,
  value,
  onChange,
  tooltip
}: {
  label: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  tooltip?: React.ReactNode;
}) {
  const [localValue, setLocalValue] = useState(defaultValue ?? options[0]);
  const currentValue = value !== undefined ? value : localValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    else setLocalValue(val);
  };

  return (
    <div style={{ marginBottom: 16, maxWidth: 320 }}>
      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <select
          value={currentValue}
          onChange={handleChange}
          style={{
            flex: 1,
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
            color: TEXT_DARK,
            background: "#fff",
            outline: "none"
          }}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <InfoIcon tooltip={tooltip} />
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
            outline: "none"
          }}
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
        marginBottom: 12
      }}
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
        margin: "16px 0"
      }}
    />
  );
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const format = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + format(n % 100) : "");
    if (n < 100000) return format(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + format(n % 1000) : "");
    if (n < 10000000) return format(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + format(n % 100000) : "");
    return format(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + format(n % 10000000) : "");
  };
  return format(Math.floor(num));
}
