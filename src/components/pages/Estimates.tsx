import { useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Download,
  Printer,
  Calendar,
  Building2,
} from "lucide-react";
import { estimates } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Estimates() {
  const [showAddEstimate, setShowAddEstimate] = useState(false);

  const totalQuotations = estimates.reduce((sum, est) => sum + est.amount, 0);
  const totalConverted = estimates
    .filter((e) => e.status === "Converted")
    .reduce((sum, est) => sum + est.amount, 0);

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Estimate/Quotation
          </h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={() => setShowAddEstimate(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Estimate
        </button>
      </div>

      {/* Filters */}
      <div
        className="p-4 bg-white rounded-md shadow-sm flex items-center gap-4"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter by :</span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
            This Month
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Between</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            01/02/2026
          </button>
          <span className="text-sm text-gray-500">To</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            28/02/2026
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200">
          <Building2 className="w-4 h-4" />
          All Firms
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div
        className="p-4 bg-white rounded-md shadow-sm"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="max-w-sm bg-[#F6F0FB] rounded-xl p-4 border border-[#E8D7F6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#6B6B83]">Total Quotations</span>
            <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
              509.09% ↓
            </span>
          </div>
          <p className="text-xl font-bold text-[#1C1F2A]">
            Rs {totalQuotations.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
            <span>Converted: Rs {totalConverted.toFixed(2)}</span>
            <span>|</span>
            <span>
              Open: Rs {(totalQuotations - totalConverted).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className="flex-1 bg-white rounded-md shadow-sm overflow-hidden"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-50 rounded-lg">
              <Search className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg">
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-lg">
              <Printer className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Reference no
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Party Name
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Balance
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((estimate) => (
                <tr
                  key={estimate.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{estimate.date}</td>
                  <td className="px-4 py-3">{estimate.referenceNo}</td>
                  <td className="px-4 py-3">{estimate.partyName}</td>
                  <td className="px-4 py-3 text-right">
                    Rs {estimate.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    Rs {estimate.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        estimate.status === "Open"
                          ? "bg-orange-100 text-orange-700"
                          : estimate.status === "Converted"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {estimate.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700">
                      Convert
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Estimate Modal */}
      <Dialog open={showAddEstimate} onOpenChange={setShowAddEstimate}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Estimate/Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name/Phone *
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Select Party</option>
                  <option>Khan</option>
                  <option>Sohaib</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ref No.
                  </label>
                  <input
                    type="text"
                    value="5"
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="text"
                    value="21/02/2026"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      #
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      ITEM
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      QTY
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      UNIT
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      PRICE/UNIT
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                        <option>NONE</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">0</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-3 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium">
                  + ADD ROW
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddEstimate(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                Cancel
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 flex items-center gap-2">
                Share
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-6 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium">
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
