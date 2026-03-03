import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Phone,
  Mail,
  ChevronDown,
  Printer,
  Settings,
  MoreVertical,
} from "lucide-react";
import { parties, transactions } from "@/data/mockData";
import type { Party } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Parties() {
  const [selectedParty, setSelectedParty] = useState<Party | null>(parties[0]);
  const [showAddParty, setShowAddParty] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "address" | "credit" | "additional"
  >("address");
  const [partyForm, setPartyForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    billingAddress: "",
    shippingAddress: "",
    openingBalance: "",
    asOfDate: new Date().toLocaleDateString("en-IN"),
    balanceType: "to-receive" as "to-pay" | "to-receive",
    creditLimit: "no-limit" as "no-limit" | "custom",
  });

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const partyTransactions = transactions.filter(
    (t) => t.partyName.toLowerCase() === selectedParty?.name.toLowerCase(),
  );

  const handleSaveParty = () => {
    console.log("Saving party:", partyForm);
    setShowAddParty(false);
  };

  return (
    <div className="h-full flex flex-col [background-color:#D0DCE7] p-0 gap-1">
      {/* Top Header Card */}
      <div className="p-4 bg-white rounded-none flex items-center justify-between shrink-0 w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Parties</h2>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddParty(true)}
            className="bg-[#E53935] hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Party
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-1 overflow-hidden">
        {/* Left Panel Card - Party List */}
        <div className="w-80 bg-white rounded-md flex flex-col shrink-0 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Party Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
              />
            </div>
          </div>

          {/* Party List Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Party Name</span>
                      <ChevronDown className="w-3 h-3 text-red-400" />
                    </div>
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr
                    key={party.id}
                    onClick={() => setSelectedParty(party)}
                    className={`cursor-pointer border-b border-gray-100 ${
                      selectedParty?.id === party.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{party.name}</span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        party.balance > 0
                          ? "text-red-500"
                          : party.balance < 0
                            ? "text-green-500"
                            : "text-gray-900"
                      }`}
                    >
                      {party.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel Card - Party Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedParty ? (
            <>
              {/* Party Details Card */}
              <div className="bg-white rounded-md shadow-sm mb-1">
                <div className="p-5 border-b border-gray-200 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedParty.name}
                      </h2>
                      <Edit2 className="w-4 h-4 text-blue-500 cursor-pointer" />
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600">
                        <Phone className="w-4 h-4 text-white" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center hover:bg-orange-500">
                        <Mail className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Party Info */}
                  <div className="flex gap-10">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Phone Number
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedParty.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm text-gray-900">
                        {selectedParty.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Billing Address
                      </p>
                      <p className="text-sm text-gray-900">Jhagra</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="flex-1 bg-white rounded-md flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0">
                  <h3 className="text-base font-semibold text-gray-900">
                    Transactions
                  </h3>
                  <div className="flex gap-2 items-center">
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Search className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Printer className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded relative">
                      <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        xls
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Type</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Number</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>Date</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          <div className="flex items-center justify-end gap-2">
                            <span>Total</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">
                          <div className="flex items-center justify-end gap-2">
                            <span>Balance</span>
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          </div>
                        </th>
                        <th className="px-2 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {partyTransactions.length > 0 ? (
                        partyTransactions.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`${
                                  t.type === "Sale"
                                    ? "text-green-600"
                                    : t.type === "Purchase"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {t.invoiceNo}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {t.date}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              Rs {t.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              Rs {t.balance.toFixed(2)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              <MoreVertical className="w-4 h-4 text-gray-400 mx-auto cursor-pointer" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a party to view details
            </div>
          )}
        </div>
      </div>

      {/* Add Party Modal */}
      <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>Add Party</DialogTitle>
            <div className="flex gap-2 ml-auto">
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </DialogHeader>

          {/* Top Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name *
              </label>
              <input
                type="text"
                value={partyForm.name}
                onChange={(e) =>
                  setPartyForm({ ...partyForm, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                placeholder="Party Name *"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={partyForm.phoneNumber}
                onChange={(e) =>
                  setPartyForm({ ...partyForm, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("address")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "address"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab("credit")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "credit"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Credit & Balance
            </button>
            <button
              onClick={() => setActiveTab("additional")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "additional"
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Additional Fields
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "address" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID
                </label>
                <input
                  type="email"
                  value={partyForm.email}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                  placeholder="Email ID"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Billing Address
                </h3>
                <textarea
                  value={partyForm.billingAddress}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      billingAddress: e.target.value,
                    })
                  }
                  placeholder="Billing Address"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                />
              </div>
              <div>
                <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                  + Enable Shipping Address
                </button>
              </div>
              <div className="text-center">
                <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
                  👁 Show Detailed Address
                </button>
              </div>
            </div>
          )}

          {activeTab === "credit" && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="text"
                    value={partyForm.openingBalance}
                    onChange={(e) =>
                      setPartyForm({
                        ...partyForm,
                        openingBalance: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    As Of Date
                  </label>
                  <input
                    type="text"
                    value={partyForm.asOfDate}
                    onChange={(e) =>
                      setPartyForm({ ...partyForm, asOfDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    placeholder="21/02/2026"
                  />
                </div>
              </div>

              <div className="flex gap-6 my-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-pay"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-pay" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">To Pay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-receive"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-receive" })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">To Receive</span>
                </label>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Credit Limit
                </h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={partyForm.creditLimit === "no-limit"}
                      onChange={() =>
                        setPartyForm({ ...partyForm, creditLimit: "no-limit" })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-blue-500 font-medium">
                      No Limit
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={partyForm.creditLimit === "custom"}
                      onChange={() =>
                        setPartyForm({ ...partyForm, creditLimit: "custom" })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Custom Limit</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "additional" && (
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-500">
                Additional fields will appear here
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 justify-end">
            <button
              onClick={() => setShowAddParty(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveParty}
              className="px-6 py-2 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50"
            >
              Save & New
            </button>
            <button
              onClick={handleSaveParty}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
