import { items } from "@/data/mockData";

export function BarcodeGeneratorForm() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name *
        </label>
        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Select Item</option>
          {items.map((item) => (
            <option key={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Code *
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Enter Item Code"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          No of Labels *
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          defaultValue={20}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Header
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Enter Header"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line 1
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Line 2
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <button className="bg-gray-300 text-white px-4 py-2 rounded-lg text-sm">
        Add for Barcode
      </button>
    </div>
  );
}
