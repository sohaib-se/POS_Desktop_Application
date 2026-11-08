export default function AdminCircularLoader({
  message = 'Retrieving records from database...',
  subtext,
  minHeight = 'min-h-[320px]',
}: {
  message?: string;
  subtext?: string;
  minHeight?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-[rgba(207,196,197,0.25)] shadow-sm ${minHeight} w-full`}
    >
      {/* Circular Spinner Ring */}
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-[3px] border-black/10 border-t-black animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-[#00ff88] animate-spin opacity-80" />
      </div>

      {/* Primary Message */}
      <p
        className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-[#1b1b1b]"
        style={{ fontFamily: "'Space Grotesk', monospace" }}
      >
        {message}
      </p>

      {/* Subtext */}
      <p className="mt-1 text-[11px] text-[#5f5e5e] font-mono">
        {subtext || 'Live streaming from database engine'}
      </p>
    </div>
  );
}
