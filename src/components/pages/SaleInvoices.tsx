import { useState } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Download,
  Printer,
  Calendar,
  Building2,
  MoreVertical,
  Share2,
} from "lucide-react";
import { saleInvoices } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SaleInvoices() {
  const [showAddSale, setShowAddSale] = useState(false);

  const totalSales = saleInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReceived = saleInvoices
    .filter((i) => i.balance === 0)
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalBalance = saleInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="h-full flex flex-col bg-[#D0DCE7] gap-1">
      {/* Header */}
      <div className="p-4 bg-white flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Sale Invoices</h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <button
          onClick={() => setShowAddSale(true)}
          className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sale
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
            <span className="text-sm text-[#6B6B83]">Total Sales Amount</span>
            <span className="flex items-center gap-1 text-xs text-[#E53935] bg-[#FCE8EA] px-2 py-0.5 rounded-full">
              18.31% ↓
            </span>
          </div>
          <p className="text-xl font-bold text-[#1C1F2A]">
            Rs {totalSales.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#6B6B83] mt-1">
            <span>Received: Rs {totalReceived.toLocaleString()}</span>
            <span>|</span>
            <span>Balance: Rs {totalBalance.toLocaleString()}</span>
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
                  Invoice no
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Party Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Payment Type
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Balance
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {saleInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{invoice.date}</td>
                  <td className="px-4 py-3">{invoice.invoiceNo}</td>
                  <td className="px-4 py-3">{invoice.partyName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {invoice.transaction}
                    </span>
                  </td>
                  <td className="px-4 py-3">{invoice.paymentType}</td>
                  <td className="px-4 py-3 text-right">Rs {invoice.amount}</td>
                  <td className="px-4 py-3 text-right">Rs {invoice.balance}</td>
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

      {/* Add Sale Modal */}
      <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Sale</span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button className="px-4 py-1.5 bg-white rounded-md text-sm font-medium shadow-sm">
                    Credit
                  </button>
                  <button className="px-4 py-1.5 text-sm text-gray-500">
                    Cash
                  </button>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <AddSaleForm onClose={() => setShowAddSale(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddSaleForm({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState([
    { id: 1, name: "", qty: 1, unit: "NONE", price: 0, amount: 0 },
  ]);
  const [customer, setCustomer] = useState("");

  const addRow = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        name: "",
        qty: 1,
        unit: "NONE",
        price: 0,
        amount: 0,
      },
    ]);
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select Party</option>
            <option value="khan">Khan</option>
            <option value="cash">Cash Sale</option>
            <option value="sfe">sfe</option>
          </select>
          {customer && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Party Balance</span>
                <span className="font-medium text-red-500">200</span>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone No.
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Phone Number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            value="10"
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

      {/* Items Table */}
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
            {items.map((item, index) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    placeholder="Select Item"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].qty = parseInt(e.target.value) || 0;
                      newItems[index].amount =
                        newItems[index].qty * newItems[index].price;
                      setItems(newItems);
                    }}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>NONE</option>
                    <option>Pcs</option>
                    <option>Box</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].price = parseInt(e.target.value) || 0;
                      newItems[index].amount =
                        newItems[index].qty * newItems[index].price;
                      setItems(newItems);
                    }}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-3 py-2 font-medium">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={addRow}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            + ADD ROW
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">TOTAL</span>
            <span className="text-lg font-bold">{total}</span>
          </div>
        </div>
      </div>

      {/* Payment & Totals */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Cash</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>UPI</option>
          </select>
          <button className="mt-2 text-blue-600 text-sm">
            + Add Payment type
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="%"
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Rs"
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>NONE</option>
              <option>GST 5%</option>
              <option>GST 12%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          Share
          <ChevronDown className="w-4 h-4" />
        </button>
        <button className="px-6 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600">
          Save
        </button>
      </div>
    </div>
  );
}
