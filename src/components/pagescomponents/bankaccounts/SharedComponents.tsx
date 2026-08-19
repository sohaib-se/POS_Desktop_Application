import React from "react";
import { ChevronDown, X, Upload } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 relative">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
  readOnly,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${readOnly ? "bg-gray-50" : "bg-white"}`}
      />
    </div>
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, value, onChange, options, className = "" }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 pr-8"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export function ImageUpload() {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">Image</label>
      <div className="border border-dashed border-gray-300 rounded-lg px-4 py-5 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
          <Upload className="w-4 h-4" />
          Add Image
        </div>
      </div>
    </div>
  );
}

export interface ModalFooterProps {
  onCancel: () => void;
  onSave?: () => void;
  saveLabel?: string;
  disabled?: boolean;
}

export function ModalFooter({ onCancel, onSave, saveLabel = "Save", disabled }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 mt-2">
      <button
        onClick={onCancel}
        className="px-5 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="px-6 py-2 bg-[#E53935] text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:opacity-50"
      >
        {saveLabel}
      </button>
    </div>
  );
}
