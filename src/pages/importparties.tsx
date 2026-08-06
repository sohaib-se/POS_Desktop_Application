import { useState } from "react";
import { ImportPartiesHeader } from "@/components/pagescomponents/utilities/importparties/ImportPartiesHeader";
import { ImportPartiesSteps } from "@/components/pagescomponents/utilities/importparties/ImportPartiesSteps";
import { ImportPartiesUpload, type ImportedParty } from "@/components/pagescomponents/utilities/importparties/ImportPartiesUpload";
import { toast } from "sonner";
import { type ViewType } from "@/types";

interface ImportPartiesProps {
  onViewChange?: (view: ViewType) => void;
}

export function ImportParties({ onViewChange }: ImportPartiesProps) {
  const [importedParties, setImportedParties] = useState<ImportedParty[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handlePartiesImported = (parties: ImportedParty[]) => {
    setImportedParties(parties);
  };

  const handleSaveParties = async () => {
    if (importedParties.length === 0) return;
    setIsSaving(true);
    let successCount = 0;
    let skippedCount = 0;
    
    try {
      // Pre-fetch parties to prevent duplication
      const partiesRes = await fetch("/api/parties");
      const existingParties = partiesRes.ok ? await partiesRes.json() : [];
      
      const existingNames = new Set(existingParties.map((p: any) => p.name?.toLowerCase()));
      const existingPhones = new Set(existingParties.map((p: any) => p.phone?.toString()));

      for (const party of importedParties) {
        const partyName = party["Party Name"]?.toString().trim();
        const partyPhone = party["Phone Number"]?.toString().trim();
        
        if (!partyName) {
          skippedCount++; // Missing required name
          continue;
        }

        // Skip duplicate parties
        if (existingNames.has(partyName.toLowerCase()) || (partyPhone && existingPhones.has(partyPhone))) {
          skippedCount++;
          continue;
        }

        const payload = {
          name: partyName,
          phone: partyPhone || "",
          email: party["Email"]?.toString().trim() || null,
          address: party["Billing Address"]?.toString().trim() || null,
          shippingAddress: party["Shipping Address"]?.toString().trim() || null,
          balance: Number(party["Opening Balance"]) || 0,
          creditLimit: Number(party["Credit Limit"]) || null,
          type: "customer", // default to customer
        };

        const response = await fetch("/api/parties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successCount++;
          existingNames.add(partyName.toLowerCase()); // prevent duplicate in same sheet
          if (partyPhone) existingPhones.add(partyPhone);
        }
      }
      
      if (successCount > 0 || skippedCount > 0) {
        if (successCount > 0 && skippedCount === 0) {
          toast.success(`Successfully imported ${successCount} parties!`);
        } else if (successCount > 0 && skippedCount > 0) {
          toast.success(`Imported ${successCount} parties. Skipped ${skippedCount} duplicates.`);
        } else if (successCount === 0 && skippedCount > 0) {
          toast.warning(`No parties imported. Skipped ${skippedCount} duplicates.`);
        }
        
        setImportedParties([]); // Disappear from import page
        if (onViewChange) {
          onViewChange("parties"); // Navigate to parties page
        }
      } else {
        toast.error("Failed to import parties.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while importing parties.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <ImportPartiesHeader />
        <div className="grid grid-cols-[1.5fr_1fr] gap-12">
          {/* Left Column: Steps and Preview */}
          <div>
            <ImportPartiesSteps />
            
            {importedParties.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Imported Parties Preview ({importedParties.length})
                  </h4>
                  <button 
                    onClick={handleSaveParties}
                    disabled={isSaving}
                    className="bg-[#1976D2] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Complete Import"}
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#4382FF] text-white">
                      <tr>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Party Name</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Phone</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Email</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Billing Address</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Shipping Address</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Balance</th>
                        <th className="px-4 py-3 font-medium whitespace-nowrap">Credit Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {importedParties.map((party, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{party["Party Name"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{party["Phone Number"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{party["Email"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">{party["Billing Address"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate">{party["Shipping Address"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{party["Opening Balance"]}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{party["Credit Limit"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Upload Box */}
          <div>
            <ImportPartiesUpload onPartiesImported={handlePartiesImported} />
          </div>
        </div>
      </div>
    </div>
  );
}
