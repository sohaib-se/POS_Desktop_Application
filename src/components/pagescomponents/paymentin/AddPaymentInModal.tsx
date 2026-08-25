import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronDown, FilePlus2, Camera } from "lucide-react";

interface AddPaymentInModalProps {
  showAddPayment: boolean;
  setShowAddPayment: (val: boolean) => void;
  parties: any[];
  selectedParty: string;
  setSelectedParty: (val: string) => void;
  partyOptions: any[];
  selectedPartyBalance: number;
  paymentType: string;
  setPaymentType: (val: string) => void;
  bankAccounts: any[];
  showDescription: boolean;
  setShowDescription: (val: boolean) => void;
  description: string;
  setDescription: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageDataUrl: string;
  setImageDataUrl: (val: string) => void;
  receiptNo: string;
  setReceiptNo: (val: string) => void;
  paymentDate: string;
  setPaymentDate: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  handleSave: () => void;
}

export function AddPaymentInModal(props: AddPaymentInModalProps) {
  return (
      <Dialog open={props.showAddPayment} onOpenChange={props.setShowAddPayment}>
        <DialogContent
          showCloseButton={false}
          className="w-[50rem] max-w-none overflow-hidden rounded-lg border-0 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
          style={{ width: "50rem", maxWidth: "50rem", minWidth: "50rem" }}
        >
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-[18px] font-semibold text-slate-900">
                Payment-In
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => props.setShowAddPayment(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B97A8] text-white hover:bg-[#748396]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-10">
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="relative">
                      <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                        Party <span className="text-[#E53935]">*</span>
                      </label>
                      <select
                        value={props.selectedParty}
                        onChange={(e) => props.setSelectedParty(e.target.value)}
                        className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8"
                      >
                        {props.partyOptions.map((party) => (
                          <option key={party.value} value={party.value}>
                            {party.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium text-[#E53935]">
                      BAL: {props.selectedPartyBalance}
                    </p>
                  </div>

                  <div className="relative w-[180px]">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                      Payment Type
                    </label>
                    <select 
                      value={props.paymentType}
                      onChange={e => props.setPaymentType(e.target.value)}
                      className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2] appearance-none pr-8">
                      <option value="Cash">Cash</option>
                      {props.bankAccounts.map((b, i) => (
                        <option key={i} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {!props.showDescription ? (
                    <button
                      type="button"
                      onClick={() => props.setShowDescription(true)}
                      className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-400 shadow-sm"
                    >
                      <FilePlus2 className="h-4 w-4" />
                      Add Description
                    </button>
                  ) : (
                    <textarea 
                      placeholder="Add description..." 
                      value={props.description}
                      onChange={e => props.setDescription(e.target.value)}
                      onBlur={(e) => {
                        if (!e.target.value.trim()) {
                          props.setShowDescription(false);
                          props.setDescription("");
                        }
                      }}
                      autoFocus
                      className="w-full rounded border border-slate-300 bg-white p-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                      rows={2}
                    />
                  )}

                  <div>
                    {!props.imageDataUrl ? (
                      <button
                        type="button"
                        onClick={() => props.fileInputRef.current?.click()}
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
                          src={props.imageDataUrl} 
                          alt="Attachment preview" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-[#2d3748]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between px-3 py-1.5">
                          <button 
                            type="button"
                            onClick={() => props.fileInputRef.current?.click()}
                            className="text-[11px] font-bold text-white tracking-wide hover:text-gray-200"
                          >
                            CHANGE
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              props.setImageDataUrl("");
                              if (props.fileInputRef.current) props.fileInputRef.current.value = "";
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
                      ref={props.fileInputRef} 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => props.setImageDataUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                </div>

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
                        value={props.receiptNo}
                        onChange={e => props.setReceiptNo(e.target.value)}
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
                          value={props.paymentDate}
                          onChange={e => props.setPaymentDate(e.target.value)}
                          className="h-8 w-full border-0 border-b border-slate-300 bg-transparent px-0 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-auto pt-8">
                    <label className="text-[13px] text-slate-500 whitespace-nowrap">
                      Received
                    </label>
                    <input
                      type="number"
                      value={props.amount}
                      onChange={e => props.setAmount(e.target.value)}
                      className="h-9 w-52 rounded border border-slate-300 bg-white px-3 text-[14px] text-slate-900 outline-none focus:border-[#1976D2]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={props.handleSave}
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
