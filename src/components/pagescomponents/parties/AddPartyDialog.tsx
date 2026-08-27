import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Party } from "@/types";
import { useSettings } from "@/hooks/useSettings";
import { PhoneInput } from "@/components/ui/phone-input";

interface AddPartyDialogProps {
  showAddParty: boolean;
  setShowAddParty: (show: boolean) => void;
  partyBeingEdited: Party | null;
  setPartyBeingEdited: (party: Party | null) => void;
  resetPartyForm: () => void;
  partyForm: any;
  setPartyForm: (form: any) => void;
  activeTab: "address" | "credit";
  setActiveTab: (tab: "address" | "credit") => void;
  showShippingAddress: boolean;
  setShowShippingAddress: (show: boolean) => void;
  handleSaveParty: (options?: { closeDialog?: boolean; resetForm?: boolean }) => Promise<void>;
  isSavingParty: boolean;

  // Delete Dialog
  partyPendingDelete: Party | null;
  setPartyPendingDelete: (party: Party | null) => void;
  isDeletingParty: boolean;
  handleDeleteParty: (party: Party) => Promise<void>;

  // Credit Limit Error Dialog
  showCreditLimitError: boolean;
  setShowCreditLimitError: (show: boolean) => void;
}

export function AddPartyDialog({
  showAddParty,
  setShowAddParty,
  partyBeingEdited,
  setPartyBeingEdited,
  resetPartyForm,
  partyForm,
  setPartyForm,
  activeTab,
  setActiveTab,
  showShippingAddress,
  setShowShippingAddress,
  handleSaveParty,
  isSavingParty,

  partyPendingDelete,
  setPartyPendingDelete,
  isDeletingParty,
  handleDeleteParty,

  showCreditLimitError,
  setShowCreditLimitError,
}: AddPartyDialogProps) {
  const [isShippingAddressEnabled] = useSettings('settings.isShippingAddressEnabled', true);

  return (
    <>
      {/* Add Party Modal */}
      <Dialog
        open={showAddParty}
        onOpenChange={(isOpen) => {
          setShowAddParty(isOpen);
          if (!isOpen) {
            setPartyBeingEdited(null);
            resetPartyForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>{partyBeingEdited ? "Edit Party" : "Add Party"}</DialogTitle>
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
              <PhoneInput
                value={partyForm.phoneNumber}
                onChange={(val) =>
                  setPartyForm({ ...partyForm, phoneNumber: val })
                }
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
              {isShippingAddressEnabled && (
                <div>
                  {!showShippingAddress ? (
                    <button
                      onClick={() => setShowShippingAddress(true)}
                      className="text-blue-500 text-sm font-medium hover:text-blue-600"
                    >
                      + Enable Shipping Address
                    </button>
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Shipping Address
                      </h3>
                      <textarea
                        value={partyForm.shippingAddress}
                        onChange={(e) =>
                          setPartyForm({
                            ...partyForm,
                            shippingAddress: e.target.value,
                          })
                        }
                        placeholder="Shipping Address"
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                      />
                    </>
                  )}
                </div>
              )}
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
                    inputMode="decimal"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    value={partyForm.openingBalance}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                        setPartyForm({
                          ...partyForm,
                          openingBalance: val,
                        });
                      }
                    }}
                    disabled={!!partyBeingEdited}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] disabled:bg-gray-100 disabled:text-gray-500"
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
                    disabled={!!partyBeingEdited}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="21/02/2026"
                  />
                </div>
              </div>

              <div className="flex gap-6 my-4">
                <label className={`flex items-center gap-2 ${partyBeingEdited ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-pay"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-pay" })
                    }
                    disabled={!!partyBeingEdited}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">To Pay</span>
                </label>
                <label className={`flex items-center gap-2 ${partyBeingEdited ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    checked={partyForm.balanceType === "to-receive"}
                    onChange={() =>
                      setPartyForm({ ...partyForm, balanceType: "to-receive" })
                    }
                    disabled={!!partyBeingEdited}
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
                {partyForm.creditLimit === "custom" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      value={partyForm.creditLimitAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                          setPartyForm({
                            ...partyForm,
                            creditLimitAmount: val,
                          });
                        }
                      }}
                      placeholder="Enter amount"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 justify-end">
            <button
              onClick={() => {
                setShowAddParty(false);
                setPartyBeingEdited(null);
                resetPartyForm();
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {!partyBeingEdited && (
              <button
                onClick={() =>
                  void handleSaveParty({ closeDialog: false, resetForm: true })
                }
                disabled={isSavingParty || !partyForm.name.trim()}
                className="px-6 py-2 border border-blue-500 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-50"
              >
                Save & New
              </button>
            )}
            <button
              onClick={() =>
                void handleSaveParty({ closeDialog: true, resetForm: true })
              }
              disabled={isSavingParty || !partyForm.name.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              {isSavingParty
                ? partyBeingEdited
                  ? "Updating..."
                  : "Saving..."
                : partyBeingEdited
                ? "Update"
                : "Save"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Party Alert Dialog */}
      <AlertDialog
        open={Boolean(partyPendingDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeletingParty) {
            setPartyPendingDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Party</AlertDialogTitle>
            <AlertDialogDescription>
              {partyPendingDelete
                ? `Are you sure you want to delete ${partyPendingDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this party?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParty}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              asChild
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            >
              <button
                type="button"
                disabled={isDeletingParty || !partyPendingDelete}
                onClick={() => {
                  if (!partyPendingDelete) {
                    return;
                  }
                  void handleDeleteParty(partyPendingDelete);
                }}
              >
                {isDeletingParty ? "Deleting..." : "Delete"}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credit Limit Error Modal */}
      <Dialog open={showCreditLimitError} onOpenChange={setShowCreditLimitError}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Validation Error</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-gray-700">
            Credit amount cannot be greater than the credit limit.
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowCreditLimitError(false)}
              className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
