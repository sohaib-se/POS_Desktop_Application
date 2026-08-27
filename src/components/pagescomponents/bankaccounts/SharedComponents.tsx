import React from "react";
import { ChevronDown, X, Camera } from "lucide-react";

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

export interface ImageUploadProps {
  imageDataUrl: string;
  setImageDataUrl: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ImageUpload({ imageDataUrl, setImageDataUrl, fileInputRef }: ImageUploadProps) {
  return (
    <div>
      {!imageDataUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-8 w-8 mt-2 items-center justify-center text-slate-400 hover:text-slate-600"
          aria-label="Add attachment"
        >
          <Camera className="h-7 w-7" />
          <span className="absolute -top-1 -left-1 bg-white rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </span>
        </button>
      ) : (
        <div className="relative group w-[180px] h-[120px] rounded overflow-hidden mt-2 border border-slate-200">
          <img 
            src={imageDataUrl} 
            alt="Attachment preview" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#2d3748]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between px-3 py-1.5">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
            >
              CHANGE
            </button>
            <button 
              type="button"
              onClick={() => {
                setImageDataUrl("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
            >
              DELETE
            </button>
          </div>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageDataUrl(reader.result as string);
            reader.readAsDataURL(file);
          }
        }} 
      />
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
