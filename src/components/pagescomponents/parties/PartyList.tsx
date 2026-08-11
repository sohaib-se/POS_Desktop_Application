import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { Party } from "@/types";

export type PartyContextMenuState = {
  party: Party;
  x: number;
  y: number;
};

interface PartyListProps {
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredParties: Party[];
  selectedParty: Party | null;
  setSelectedParty: (party: Party) => void;
  openEditPartyDialog: (party: Party) => void;
  setPartyPendingDelete: (party: Party) => void;
  isReportView?: boolean;
}

export function PartyList({
  isLoading,
  searchTerm,
  setSearchTerm,
  filteredParties,
  selectedParty,
  setSelectedParty,
  openEditPartyDialog,
  setPartyPendingDelete,
  isReportView,
}: PartyListProps) {
  const [partyContextMenu, setPartyContextMenu] = useState<PartyContextMenuState | null>(null);

  useEffect(() => {
    if (!partyContextMenu) {
      return;
    }

    const closeMenu = () => setPartyContextMenu(null);

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [partyContextMenu]);

  return (
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
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E53935]"></div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>Party Name</span>
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
                  onContextMenu={(event) => {
                    if (isReportView) return;
                    event.preventDefault();
                    setPartyContextMenu({
                      party,
                      x: event.clientX,
                      y: event.clientY,
                    });
                  }}
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
                        ? "text-green-500"
                        : party.balance < 0
                        ? "text-red-500"
                        : "text-gray-900"
                    }`}
                  >
                    {party.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {partyContextMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-md border bg-white p-1 shadow-md"
          style={{
            top: partyContextMenu.y,
            left: partyContextMenu.x,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => {
              setSelectedParty(partyContextMenu.party);
              openEditPartyDialog(partyContextMenu.party);
              setPartyContextMenu(null);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
          >
            View/Edit
          </button>
          <button
            onClick={() => {
              setPartyContextMenu(null);
              setPartyPendingDelete(partyContextMenu.party);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
