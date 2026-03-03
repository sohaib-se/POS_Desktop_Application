import { useState } from "react";
import { Plus, Printer, Landmark, Wallet, CreditCard } from "lucide-react";
import { cashInHandTransactions } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CashBankProps {
  subView: string;
}

export function CashBank({ subView }: CashBankProps) {
  const [showAddBank, setShowAddBank] = useState(false);

  const totalCash = 1240;

  if (subView === "bank-accounts") {
    return (
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1 p-1">
        <div
          className="bg-white rounded-md shadow-sm p-6 flex-1 overflow-auto"
          style={{ marginLeft: "4px", marginRight: "4px" }}
        >
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl transform rotate-6"></div>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Landmark className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-lg">$</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-sm">$</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Manage Multiple Bank Accounts
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              With Vyapar, you can organize multiple bank accounts and track all
              your financial transactions in one place.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Printer className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Print Bank Details on Invoices
                </h3>
                <p className="text-xs text-gray-500">
                  Share your bank account information on invoices so customers
                  can pay you easily.
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Unlimited Payment Types
                </h3>
                <p className="text-xs text-gray-500">
                  Record payments received through banks, cards, or any method
                  you prefer.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Maintain Accurate Records
                </h3>
                <p className="text-xs text-gray-500">
                  Keep your financial entries organised for better clarity and
                  reporting.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddBank(true)}
              className="bg-[#E53935] hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>
        </div>

        {/* Add Bank Account Modal */}
        <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Display Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Enter Account Display Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Enter Opening Balance"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  As of Date
                </label>
                <input
                  type="text"
                  value="21/02/2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="printDetails" className="rounded" />
                <label htmlFor="printDetails" className="text-sm text-gray-700">
                  Print Bank Details on Invoices
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Enter Bank Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Enter Account Holder Name"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddBank(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-[#E53935] text-white rounded-lg text-sm font-medium hover:bg-red-600">
                  Save Details
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (subView === "cash-in-hand") {
    return (
      <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
        <div className="bg-white shadow-sm p-4 flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-gray-900">Cash In Hand</h2>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-900">
              Rs {totalCash.toLocaleString()}
            </span>
            <button className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Money
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div
            className="bg-white rounded-md shadow-sm overflow-hidden"
            style={{ marginLeft: "4px", marginRight: "4px" }}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {cashInHandTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{tx.date}</td>
                    <td className="px-4 py-3">{tx.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          tx.type === "Payment-In"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            tx.type === "Payment-In"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        tx.type === "Payment-In"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "Payment-In" ? "+" : "-"} Rs {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center text-gray-500">
        <Landmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">Select a Cash & Bank option from the sidebar</p>
      </div>
    </div>
  );
}
