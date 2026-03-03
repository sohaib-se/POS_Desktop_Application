import { Search, Plus, Settings, X, ChevronDown } from "lucide-react";
import type { ViewType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export function Header({ onViewChange }: HeaderProps) {
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Transactions"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddSale(true)}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sale
          </button>
          <button
            onClick={() => setShowAddPurchase(true)}
            className="bg-[#1976D2] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Purchase
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onViewChange("settings")}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Sale Modal */}
      <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Sale</span>
              <button
                onClick={() => setShowAddSale(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <AddSaleForm onClose={() => setShowAddSale(false)} />
        </DialogContent>
      </Dialog>

      {/* Add Purchase Modal */}
      <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Purchase</span>
              <button
                onClick={() => setShowAddPurchase(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <AddPurchaseForm onClose={() => setShowAddPurchase(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function AddSaleForm({ onClose }: { onClose: () => void }) {
  const [customer, setCustomer] = useState("");
  const [paymentType, setPaymentType] = useState("Credit");
  const [items, setItems] = useState([
    { id: 1, name: "", qty: 1, unit: "NONE", price: 0, amount: 0 },
  ]);

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
      {/* Payment Type Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPaymentType("Credit")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${paymentType === "Credit" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            Credit
          </button>
          <button
            onClick={() => setPaymentType("Cash")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${paymentType === "Cash" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
          >
            Cash
          </button>
        </div>
      </div>

      {/* Customer & Invoice Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
          >
            <option value="">Select Party</option>
            <option value="khan">Khan (BAL: 100)</option>
            <option value="cash">Cash Sale (BAL: 200)</option>
            <option value="sfe">sfe (BAL: 0)</option>
          </select>
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
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={addRow}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            + ADD ROW
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <span className="font-medium">{total}</span>
          </div>
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
              <option>GST 18%</option>
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

function AddPurchaseForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-500">
        <p>Purchase form - Similar to Sale form with supplier selection</p>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button className="px-6 py-2 bg-[#1976D2] text-white rounded-lg text-sm font-medium hover:bg-blue-600">
          Save
        </button>
      </div>
    </div>
  );
}
