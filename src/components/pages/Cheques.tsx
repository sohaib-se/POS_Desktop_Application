import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Cheques() {
  const [showAddCheque, setShowAddCheque] = useState(false);

  const chequeData = [
    {
      id: "1",
      date: "26/02/2026",
      chequeNo: "CHQ-001",
      bank: "State Bank",
      amount: 5000,
      status: "Pending",
    },
    {
      id: "2",
      date: "25/02/2026",
      chequeNo: "CHQ-002",
      bank: "HDFC Bank",
      amount: 10000,
      status: "Cleared",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Cheques</h2>
        </div>
        <button
          onClick={() => setShowAddCheque(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Cheque
        </button>
      </div>

      {/* Table Card */}
      <div
        className="flex-1 bg-white rounded-md shadow-sm overflow-auto"
        style={{ marginLeft: "4px", marginRight: "4px", marginBottom: "4px" }}
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                DATE
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                CHEQUE NO.
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                BANK NAME
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                AMOUNT
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {chequeData.map((cheque) => (
              <tr
                key={cheque.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">{cheque.date}</td>
                <td className="px-4 py-3">{cheque.chequeNo}</td>
                <td className="px-4 py-3">{cheque.bank}</td>
                <td className="px-4 py-3 text-right font-medium">
                  Rs {cheque.amount}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      cheque.status === "Cleared"
                        ? "bg-[#E6F4EA] text-[#43A047]"
                        : "bg-[#FCE8EA] text-[#E53935]"
                    }`}
                  >
                    {cheque.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Cheque Modal */}
      <Dialog open={showAddCheque} onOpenChange={setShowAddCheque}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Cheque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Number *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter Cheque Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Date
                </label>
                <input
                  type="text"
                  value="26/02/2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Select Bank</option>
                <option>State Bank</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter Amount"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddCheque(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
