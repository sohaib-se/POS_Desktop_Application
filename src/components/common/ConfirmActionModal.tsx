import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  hideCancel = false,
}: ConfirmActionModalProps) {
  const { t } = useTranslation();
  const resolvedConfirmText = confirmText || t("common.confirm", "Confirm");
  const resolvedCancelText = cancelText || t("common.cancel", "Cancel");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[#E53935]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-sm">
            {message}
          </p>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          {!hideCancel && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              {resolvedCancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#E53935] border border-transparent rounded-lg hover:bg-[#D32F2F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E53935] transition-colors flex items-center gap-2"
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
