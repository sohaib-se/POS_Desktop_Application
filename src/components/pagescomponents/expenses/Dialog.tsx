import type { DialogProps, DialogContentProps, DialogHeaderProps, DialogTitleProps } from "./types";

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-y-auto">
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      ></div>
      <div className="relative z-10 w-full flex justify-center p-4">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }: DialogContentProps) => (
  <div
    className={`bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl ${className || ""}`}
  >
    {children}
  </div>
);

export const DialogHeader = ({ children }: DialogHeaderProps) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children, className }: DialogTitleProps) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);
