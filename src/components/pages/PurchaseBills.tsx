import { useState } from "react";
import {
  Plus,
  ChevronDown,
  Printer,
  Calendar,
  Building2,
  MoreVertical,
  Share2,
} from "lucide-react";
import { purchaseBills } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PurchaseBills() {
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  const totalPaid = 0;
  const totalUnpaid = purchaseBills.reduce((sum, b) => sum + b.amount, 0);
  const total = totalPaid + totalUnpaid;

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Purchase Bills
          </h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={() => setShowAddPurchase(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Purchase
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
          Laimsoft
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div
        className="p-4 bg-white rounded-md shadow-sm"
        style={{ marginLeft: "4px", marginRight: "4px" }}
      >
        <div className="flex items-center gap-4">
          {/* Paid Card */}
          <div className="bg-[#B2DFDB] rounded-xl p-4 min-w-[140px]">
            <p className="text-sm text-gray-700 mb-1">Paid</p>
            <p className="text-xl font-bold text-gray-900">
              Rs {totalPaid.toFixed(2)}
            </p>
          </div>

          <span className="text-2xl text-gray-400">+</span>

          {/* Unpaid Card */}
          <div className="bg-[#BBDEFB] rounded-xl p-4 min-w-[140px]">
            <p className="text-sm text-gray-700 mb-1">Unpaid</p>
            <p className="text-xl font-bold text-gray-900">
              Rs {totalUnpaid.toFixed(2)}
            </p>
          </div>

          <span className="text-2xl text-gray-400">=</span>

          {/* Total Card */}
          <div className="bg-[#FFE082] rounded-xl p-4 min-w-[140px]">
            <p className="text-sm text-gray-700 mb-1">Total</p>
            <p className="text-xl font-bold text-gray-900">
              Rs {total.toFixed(2)}
            </p>
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
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  DATE
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  INVOICE NO.
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  PARTY NAME
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  PAYMENT TYPE
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  AMOUNT
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  BALANCE DUE
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {purchaseBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{bill.date}</td>
                  <td className="px-4 py-3">{bill.invoiceNo}</td>
                  <td className="px-4 py-3">{bill.partyName}</td>
                  <td className="px-4 py-3">{bill.paymentType}</td>
                  <td className="px-4 py-3 text-right">{bill.amount}</td>
                  <td className="px-4 py-3 text-right">{bill.balance}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Printer className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Select Party</option>
                  <option>Khan</option>
                  <option>sfe</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                onClick={() => setShowAddPurchase(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                Cancel
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
