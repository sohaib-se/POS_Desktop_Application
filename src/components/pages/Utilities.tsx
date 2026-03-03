import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  Search,
  Play,
  ChevronDown,
} from "lucide-react";
import { items } from "@/data/mockData";

type UtilitiesTab =
  | "import-items"
  | "barcode"
  | "bulk-update"
  | "import-parties"
  | "export-tally"
  | "export-items"
  | "verify-data"
  | "recycle-bin";

interface UtilitiesProps {
  initialTab?: UtilitiesTab;
}

export function Utilities({ initialTab = "import-items" }: UtilitiesProps) {
  const activeTab = initialTab;

  return (
    <div className="h-full bg-white">
      <div className="h-full overflow-y-auto p-6">
        {activeTab === "import-items" && <ImportItems />}
        {activeTab === "barcode" && <BarcodeGenerator />}
        {activeTab === "bulk-update" && <BulkUpdate />}
        {activeTab === "import-parties" && <ImportParties />}
        {activeTab === "export-tally" && <ExportToTally />}
        {activeTab === "export-items" && <ExportItems />}
        {activeTab === "verify-data" && <VerifyData />}
        {activeTab === "recycle-bin" && <RecycleBin />}
      </div>
    </div>
  );
}

function ImportItems() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Import Items From Excel File
      </h3>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 1</h4>
            <p className="text-sm text-gray-600 mb-3">
              Create an Excel file with the following format.
            </p>
            <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
              Download Sample
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 2</h4>
            <p className="text-sm text-gray-600 mb-3">
              Upload the file{" "}
              <span className="font-medium">(.xlsx or .xls)</span> by clicking
              on the Upload File button below.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 3</h4>
            <p className="text-sm text-gray-600">
              Verify the items from the file & complete the import.
            </p>
          </div>

          {/* Sample Table */}
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="px-2 py-1">Item Name</th>
                  <th className="px-2 py-1">Item Code</th>
                  <th className="px-2 py-1">Sale Price</th>
                  <th className="px-2 py-1">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-2 py-1">Item 1</td>
                  <td className="px-2 py-1">H001</td>
                  <td className="px-2 py-1">10</td>
                  <td className="px-2 py-1">8</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-2 py-1">Item 2</td>
                  <td className="px-2 py-1">H002</td>
                  <td className="px-2 py-1">15</td>
                  <td className="px-2 py-1">12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-4">
            Upload your .xls/ .xlsx (excel sheet)
          </p>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Drag & Drop files here</p>
            <p className="text-sm text-gray-400 mb-4">or</p>
            <button className="bg-[#E53935] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto">
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarcodeGenerator() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Barcode Generator
      </h3>

      <div className="grid grid-cols-2 gap-8">
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
      </div>
    </div>
  );
}

function BulkUpdate() {
  const [activeTab, setActiveTab] = useState<"pricing" | "stock" | "info">(
    "pricing",
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Bulk Update Items
      </h3>

      <div className="flex items-center justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by item name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "pricing" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "pricing" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Pricing
            </button>
            <button
              onClick={() => setActiveTab("stock")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "stock" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "stock" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Stock
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${activeTab === "info" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${activeTab === "info" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
              ></div>
              Item Information
            </button>
          </div>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600">
            Update Tax Slab
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                #
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                ITEM NAME *
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                CATEGORY
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                PURCHASE PRICE
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                SALE PRICE
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.category?.split(",").map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    defaultValue={item.purchasePrice}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    defaultValue={item.salePrice}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Play className="w-4 h-4 text-red-500" />
          <span>Watch Youtube tutorial to learn more</span>
        </div>
        <button className="bg-[#E53935] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Play className="w-4 h-4" />
          Watch Video
        </button>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <span className="text-sm text-gray-500">
          Pricing - 0 Updates, Stock - 0 Updates, Item Information - 0 Updates
        </span>
        <button className="px-6 py-2 bg-gray-300 text-white rounded-lg text-sm">
          Update
        </button>
      </div>
    </div>
  );
}

function ImportParties() {
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        Import Excel
      </h3>

      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Download .xls/.xlsx (excel sheet) template file to enter Data
          </p>
          <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-12 h-12 text-blue-500" />
          </div>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Download
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Upload your .xls/ .xlsx (excel sheet)
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="w-12 h-12 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500">
              Drag and drop or{" "}
              <span className="text-blue-500 cursor-pointer">
                Click here to Browse
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              formatted excel file to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportToTally() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Export to Tally
      </h3>

      <div className="flex items-center gap-4 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
          This Month
          <ChevronDown className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-500">Between</span>
        <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
          01/02/2026
        </button>
        <span className="text-sm text-gray-500">To</span>
        <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
          28/02/2026
        </button>
        <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
          Laimsoft
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {[
          "Sale",
          "Credit Note",
          "Purchase",
          "Debit Note",
          "Sale(Cancelled)",
        ].map((type) => (
          <div key={type} className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700">{type}</span>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                DATE
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                REF. NO.
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                PARTY NAME
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                TRANSACTION TYPE
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                PAYMENT TYPE
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                AMOUNT
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                BALANCE
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3">01/02/2026</td>
              <td className="px-4 py-3">3</td>
              <td className="px-4 py-3">Walking Customer</td>
              <td className="px-4 py-3">Sale</td>
              <td className="px-4 py-3">Cash</td>
              <td className="px-4 py-3 text-right">200</td>
              <td className="px-4 py-3 text-right">200</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Play className="w-4 h-4 text-blue-500" />
          <span>Learn how to export Vyapar data to Tally.</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 flex items-center gap-2">
            <Play className="w-4 h-4" />
            Watch Video
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="font-bold italic">Tally</span>
            Export To Tally
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportItems() {
  return (
    <div className="text-center py-12">
      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Items</h3>
      <p className="text-gray-500 mb-6">
        Export all your items to an Excel file
      </p>
      <button className="bg-[#E53935] text-white px-6 py-2 rounded-lg text-sm font-medium">
        Export to Excel
      </button>
    </div>
  );
}

function VerifyData() {
  return (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Verify My Data
      </h3>
      <p className="text-gray-500 mb-6">
        Check your data for any inconsistencies
      </p>
      <button className="bg-[#1976D2] text-white px-6 py-2 rounded-lg text-sm font-medium">
        Start Verification
      </button>
    </div>
  );
}

function RecycleBin() {
  return (
    <div className="text-center py-12">
      <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Recycle Bin</h3>
      <p className="text-gray-500">No deleted items found</p>
    </div>
  );
}
