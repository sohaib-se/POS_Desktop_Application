import React, { useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Calculator,
  Settings,
  X,
  ChevronDown,
  FilePlus2,
  Camera,
  Calendar,
} from "lucide-react";

interface AddPaymentOutModalProps {
  showAddPayment: boolean;
  setShowAddPayment: (show: boolean) => void;
  selectedParty: string;
  setSelectedParty: (party: string) => void;
  partyOptions: any[];
  selectedPartyBalance: number;
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
  paymentType,
  setPaymentType,
  bankAccounts,
  referenceNo,
  setReferenceNo,
  showDescription,
  setShowDescription,
  description,
  setDescription,
  imageDataUrl,
  setImageDataUrl,
  paymentNo,
  setPaymentNo,
  paymentDate,
  setPaymentDate,
  amount,
  setAmount,
  handleSave,
}: AddPaymentOutModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                aria-label="Calculator"
              >
                <Calculator className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E53935]" />
              </button>
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
                  <p className="mt-1.5 text-[12px] font-medium text-[#E53935]">
                    BAL: {selectedPartyBalance}
                  </p>
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

                {/* Reference No */}
                <div className="relative w-full">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                    Reference No
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                  />
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
                    className="w-full rounded border border-slate-300 bg-white p-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                    rows={2}
                  />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-8 w-8 items-center justify-center text-slate-400 border border-slate-300 rounded hover:bg-slate-50"
                    aria-label="Add attachment"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
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
                  {imageDataUrl && (
                    <span className="text-[12px] text-slate-500">
                      Image attached
                    </span>
                  )}
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
                      Payment No
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
                        type="text"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 pr-8 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                      />
                      <Calendar className="absolute right-0 top-1.5 h-4 w-4 text-slate-400" />
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
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-9 w-52 rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
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
                  className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-5 text-[14px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Share
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
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
