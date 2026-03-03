import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoanAccounts() {
  const [showAddLoan, setShowAddLoan] = useState(false);

  const loanData = [
    {
      id: "1",
      loanName: "Business Loan",
      bank: "HDFC Bank",
      amount: 500000,
      interestRate: 8.5,
      status: "Active",
    },
    {
      id: "2",
      loanName: "Working Capital Loan",
      bank: "State Bank",
      amount: 250000,
      interestRate: 7.5,
      status: "Active",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Loan Accounts</h2>
        </div>
        <button
          onClick={() => setShowAddLoan(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Loan Account
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
                LOAN NAME
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                BANK NAME
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                LOAN AMOUNT
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 text-xs">
                INTEREST RATE
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 text-xs">
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            {loanData.map((loan) => (
              <tr
                key={loan.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">{loan.loanName}</td>
                <td className="px-4 py-3">{loan.bank}</td>
                <td className="px-4 py-3 text-right font-medium">
                  Rs {loan.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">{loan.interestRate}%</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-[#E6F4EA] text-[#43A047]">
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Loan Account Modal */}
      <Dialog open={showAddLoan} onOpenChange={setShowAddLoan}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Loan Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter Loan Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Select Bank</option>
                  <option>HDFC Bank</option>
                  <option>State Bank</option>
                  <option>ICICI Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Enter Loan Amount"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter Interest Rate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Start Date
              </label>
              <input
                type="text"
                value="26/02/2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAddLoan(false)}
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
