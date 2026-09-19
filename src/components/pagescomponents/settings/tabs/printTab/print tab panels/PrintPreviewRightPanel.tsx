import { useState } from "react";
import { Printer, Download, Check } from "lucide-react";
import { toast } from "@/components/ui/Toast";

export interface PrintPreviewRightPanelProps {
  onClose?: () => void;
  onPrint?: () => void;
}

export function PrintPreviewRightPanel({ onClose, onPrint }: PrintPreviewRightPanelProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>(
    () => localStorage.getItem("print_preview_printer") || "default"
  );

  const printers = [
    { id: "default", name: "Default System Printer" },
    { id: "thermal_80", name: "Thermal Receipt Printer (80mm)" },
    { id: "thermal_58", name: "Thermal Receipt Printer (58mm)" },
    { id: "pdf", name: "Microsoft Print to PDF" },
  ];

  const handlePrinterSelect = (id: string) => {
    setSelectedPrinter(id);
    localStorage.setItem("print_preview_printer", id);
  };

  const handleDownloadPDF = () => {
    toast.info("Download PDF option is non-functional for now.");
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "16px", gap: "20px" }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "0.1px" }}>
          Print Controls
        </h3>
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>
          Configure printer options and print invoice.
        </p>
      </div>

      {/* Select Printer Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
          <Printer size={15} style={{ color: "#4b5563" }} />
          Select Printer
        </label>
        <select
          value={selectedPrinter}
          onChange={(e) => handlePrinterSelect(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#111827",
            outline: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {printers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #e5e7eb" }} />

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Print Button */}
        <button
          onClick={handlePrint}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          <Printer size={16} />
          Print Invoice
        </button>

        {/* Download PDF Button (Non-functional) */}
        <button
          onClick={handleDownloadPDF}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#4b5563",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e5e7eb";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "#4b5563";
          }}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Spacer to push Close to bottom */}
      <div style={{ flex: 1 }} />

      {/* Close/Done Button */}
      {onClose && (
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              width: "100%",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
          >
            <Check size={16} />
            Done / Close Preview
          </button>
        </div>
      )}
    </div>
  );
}
