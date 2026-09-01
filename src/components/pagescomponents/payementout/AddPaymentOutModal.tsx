import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  X,
  ChevronDown,
  FilePlus2,
  Camera,
} from "lucide-react";

interface AddPaymentOutModalProps {
  showAddPayment: boolean;
  setShowAddPayment: (show: boolean) => void;
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  partyOptions: any[];
  selectedPartyBalance: number;
  systemName?: string;
  paymentType: string;
  setPaymentType: (type: string) => void;
  bankAccounts: any[];
  referenceNo: string;
  setReferenceNo: (ref: string) => void;
  showDescription: boolean;
  setShowDescription: (show: boolean) => void;
  description: string;
  setDescription: (desc: string) => void;
  imageDataUrl: string;
  setImageDataUrl: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  paymentNo: string;
  setPaymentNo: (no: string) => void;
  paymentDate: string;
  setPaymentDate: (date: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  handleSave: () => void;
}

export function AddPaymentOutModal({
  showAddPayment,
  setShowAddPayment,
  selectedParty,
  setSelectedParty,
  partyOptions,
  selectedPartyBalance,
  systemName,
  paymentType,
  setPaymentType,
  bankAccounts,
  showDescription,
  setShowDescription,
  description,
  setDescription,
  imageDataUrl,
  setImageDataUrl,
  fileInputRef,
  paymentNo,
  setPaymentNo,
  paymentDate,
  setPaymentDate,
  amount,
  setAmount,
  handleSave,
}: AddPaymentOutModalProps) {

  return (
    <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
      <DialogContent
        showCloseButton={false}
        className="w-[50rem] max-w-none overflow-hidden rounded-lg border-0 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        style={{ width: "50rem", maxWidth: "50rem", minWidth: "50rem" }}
      >
        <div className="flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[18px] font-semibold text-slate-900">
              Payment-Out
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddPayment(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B97A8] text-white hover:bg-[#748396]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-10">
              {/* Left column */}
              <div className="flex flex-col gap-5">
                <div>
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                      Party <span className="text-[#E53935]">*</span>
                    </label>
                    <select
                      value={selectedParty}
                      onChange={(e) => setSelectedParty(e.target.value)}
                      className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8"
                    >
                      <option value="">Select Party</option>
                      {partyOptions.map((party) => (
                        <option key={party.value} value={party.value}>
                          {party.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  {selectedPartyBalance !== 0 ? (
                    <p className={`mt-1.5 text-[12px] font-medium ${selectedPartyBalance < 0 ? 'text-[#E53935]' : 'text-[#43A047]'}`}>
                      {selectedPartyBalance < 0
                        ? `Payable balance by ${systemName || "System"}: ${Math.abs(selectedPartyBalance)}`
                        : `Receivable balance by ${systemName || "System"}: ${Math.abs(selectedPartyBalance)}`}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[12px] font-medium text-slate-500">
                      BAL: 0
                    </p>
                  )}
                </div>

                <div className="relative w-[180px]">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8"
                  >
                    <option value="Cash">Cash</option>
                    {bankAccounts.map((b, i) => (
                      <option key={i} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {!showDescription ? (
                  <button
                    type="button"
                    onClick={() => setShowDescription(true)}
                    className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-400 shadow-sm"
                  >
                    <FilePlus2 className="h-4 w-4" />
                    Add Description
                  </button>
                ) : (
                  <textarea
                    placeholder="Add description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        setShowDescription(false);
                        setDescription("");
                      }
                    }}
                    autoFocus
                    className="w-full rounded border border-slate-300 bg-white p-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                    rows={2}
                  />
                )}

                <div>
                  {!imageDataUrl ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative flex h-8 w-8 mt-2 items-center justify-center text-slate-400 hover:text-slate-600"
                      aria-label="Add attachment"
                    >
                      <Camera className="h-7 w-7" />
                      <span className="absolute -top-1 -left-1 bg-white rounded-full text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </span>
                    </button>
                  ) : (
                    <div className="relative group w-[180px] h-[120px] rounded overflow-hidden mt-2 border border-slate-200">
                      <img
                        src={imageDataUrl}
                        alt="Attachment preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-[#2d3748]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
                        >
                          CHANGE
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageDataUrl("");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setImageDataUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Right column */}
              <div
                className="flex flex-col justify-between"
                style={{ minHeight: "280px" }}
              >
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="mb-1.5 block text-[12px] text-slate-500">
                      Receipt No
                    </label>
                    <input
                      type="text"
                      value={paymentNo}
                      onChange={(e) => setPaymentNo(e.target.value)}
                      className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] text-slate-500">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-auto pt-8">
                  <label className="text-[13px] text-slate-500 whitespace-nowrap">
                    Paid
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || Number(val) >= 0) {
                        setAmount(val);
                      }
                    }}
                    min="0"
                    className="h-9 w-52 rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 rounded bg-[#1E88F7] px-8 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(30,136,247,0.3)] hover:bg-[#1878dd]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
