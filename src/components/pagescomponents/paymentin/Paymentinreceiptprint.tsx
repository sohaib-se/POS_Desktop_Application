import { useSettings } from "@/hooks/useSettings";

interface PaymentInReceiptPrintProps {
    record: any;
    businessProfile?: any;
}

// --- Number to words helper (Indian/Pakistani numbering: thousand, lakh, crore) ---
const ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function convertBelowThousand(num: number): string {
    let str = "";
    if (num >= 100) {
        str += `${ONES[Math.floor(num / 100)]} Hundred `;
        num %= 100;
    }
    if (num >= 20) {
        str += `${TENS[Math.floor(num / 10)]} `;
        num %= 10;
    }
    if (num > 0) {
        str += `${ONES[num]} `;
    }
    return str.trim();
}

function numberToWords(num: number): string {
    if (num === 0) return "";
    let result = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const rest = num;

    if (crore > 0) result += `${convertBelowThousand(crore)} Crore `;
    if (lakh > 0) result += `${convertBelowThousand(lakh)} Lakh `;
    if (thousand > 0) result += `${convertBelowThousand(thousand)} Thousand `;
    if (rest > 0) result += convertBelowThousand(rest);

    return result.trim();
}

function amountInWords(amount: number, currencyName = "Rupees"): string {
    const whole = Math.floor(amount);
    const fraction = Math.round((amount - whole) * 100);

    const wholeWords = whole === 0 ? "Zero" : numberToWords(whole);
    let words = `${wholeWords} ${currencyName}`;

    if (fraction > 0) {
        words += ` and ${numberToWords(fraction)} Paisa`;
    }

    return `${words} only`;
}

export function PaymentInReceiptPrint({ record, businessProfile }: PaymentInReceiptPrintProps) {
    const [currency] = useSettings('settings.businessCurrency', { code: 'PKR', symbol: 'Rs', name: 'Rupees' });
    const [currencyDisplay] = useSettings<'abbreviation' | 'icon'>('settings.currencyDisplay', 'abbreviation');
    const currencyStr = currencyDisplay === 'icon' ? currency.symbol : currency.code;

    const businessName = businessProfile?.business_name || "Laimsoft";
    const phoneNumber = businessProfile?.phone_number || "3369322038";

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
            }
        } else if (dateStr.includes('-')) {
            const parts = dateStr.split('T')[0].split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        }
        return dateStr;
    };

    const amount = Number(record?.amount || 0);
    const partyName = record?.partyName || record?.party_name || "";
    const receiptNo = record?.receiptNo || record?.receipt_no || "";
    const date = formatDate(record?.date || "");

    return (
        <div className="print-area bg-white text-black font-sans w-full max-w-[794px] mx-auto px-8 py-8">
            {/* Title */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">Payment Receipt</h1>
            </div>

            {/* Business Info Box */}
            <div className="border border-gray-400 px-4 py-3">
                <h2 className="text-lg font-bold text-gray-900">{businessName}</h2>
                <p className="text-xs text-gray-600">
                    Phone: <span className="font-semibold text-gray-800">{phoneNumber}</span>
                </p>
            </div>

            {/* Received From / Receipt Details Box */}
            <div className="border border-t-0 border-gray-400 grid grid-cols-2">
                <div className="border-r border-gray-400">
                    <div className="bg-gray-100 border-b border-gray-400 px-3 py-1">
                        <p className="text-xs font-bold text-gray-800">Received From:</p>
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-sm font-bold text-gray-900">{partyName}</p>
                    </div>
                </div>
                <div>
                    <div className="bg-gray-100 border-b border-gray-400 px-3 py-1">
                        <p className="text-xs font-bold text-gray-800">Receipt Details:</p>
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-xs text-gray-800">
                            Receipt No.: <span className="font-bold">{receiptNo}</span>
                        </p>
                        <p className="text-xs text-gray-800">
                            Date: <span className="font-bold">{date}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Received Amount Box */}
            <div className="border border-t-0 border-gray-400 px-3 py-2 flex items-center text-xs text-gray-800">
                <span className="flex-none">Received</span>
                <span className="flex-1 text-center">:</span>
                <span className="flex-none font-semibold">
                    {currencyStr} {amount.toFixed(2)}
                </span>
            </div>

            {/* Amount in Words Box */}
            <div className="border border-t-0 border-gray-400">
                <div className="bg-gray-100 border-b border-gray-400 px-3 py-1">
                    <p className="text-xs font-bold text-gray-800">Amount in Words:</p>
                </div>
                <div className="px-3 py-2">
                    <p className="text-xs text-gray-800">
                        {amountInWords(amount, (currency as any).name || "Rupees")}
                    </p>
                </div>
            </div>

            {/* Signature Box */}
            <div className="flex justify-end mt-6">
                <div className="border border-gray-400 w-1/2">
                    <div className="bg-gray-100 border-b border-gray-400 px-3 py-1">
                        <p className="text-xs font-bold text-gray-800">For {businessName}:</p>
                    </div>
                    <div className="h-24 flex items-end justify-center pb-2">
                        <p className="text-xs text-gray-800">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    );
}