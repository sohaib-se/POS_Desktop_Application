import React from "react";

// --- SHARED PRIMITIVE UI COMPONENTS ---

export const Card = ({
  children,
  className,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`bg-white rounded-lg border shadow-sm ${className || ""}`}
    style={style}
  >
    {children}
  </div>
);

export const CardHeader = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => <div className={`${className || ""}`}>{children}</div>;

export const CardContent = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => <div className={`${className || ""}`}>{children}</div>;

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}) => {
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

export const DialogContent = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg p-6 w-full max-w-lg relative shadow-xl ${className || ""}`}
  >
    {children}
  </div>
);

export const DialogHeader = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div className="mb-4">{children}</div>;

export const DialogTitle = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
);
