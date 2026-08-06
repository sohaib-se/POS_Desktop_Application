import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export function StatsCards() {
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [receivableParties, setReceivableParties] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [payableParties, setPayableParties] = useState(0);

  useEffect(() => {
    async function fetchParties() {
      try {
        const response = await fetch('/api/parties');
        if (!response.ok) return;
        const dbParties = await response.json();
        
        let receivable = 0;
        let receivableCount = 0;
        let payable = 0;
        let payableCount = 0;

        dbParties.forEach((party: any) => {
          const balance = Number(party.balance ?? 0);
          if (balance > 0) {
            receivable += balance;
            receivableCount++;
          } else if (balance < 0) {
            payable += Math.abs(balance);
            payableCount++;
          }
        });

        setTotalReceivable(receivable);
        setReceivableParties(receivableCount);
        setTotalPayable(payable);
        setPayableParties(payableCount);
      } catch (error) {
        console.error("Failed to fetch parties for stats:", error);
      }
    }

    fetchParties();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Total Receivable */}
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Receivable</p>
            <p className="text-2xl font-bold text-gray-900">Rs {totalReceivable.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">From {receivableParties} Part{receivableParties === 1 ? 'y' : 'ies'}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Payable */}
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">Rs {totalPayable.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">From {payableParties} Part{payableParties === 1 ? 'y' : 'ies'}</p>
          </div>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
