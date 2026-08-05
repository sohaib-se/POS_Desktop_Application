export function BarcodeGeneratorPreview() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">Preview</p>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="bg-white p-4 rounded shadow-sm">
          <p className="text-xs text-center mb-2">Header</p>
          <div className="h-16 bg-gray-100 flex items-center justify-center mb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 ${i % 3 === 0 ? "h-10" : "h-8"} bg-black`}
                ></div>
              ))}
            </div>
          </div>
          <p className="text-xs text-center">Item Code</p>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">
          Preview
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-300 text-white rounded-lg text-sm">
          Generate
        </button>
      </div>
    </div>
  );
}
