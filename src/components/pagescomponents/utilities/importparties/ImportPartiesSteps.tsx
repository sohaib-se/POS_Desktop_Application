import * as xlsx from "xlsx-js-style";

export function ImportPartiesSteps() {
  const downloadSample = () => {
    const headers = [
      "Party Name",
      "Phone Number",
      "Email",
      "Billing Address",
      "Shipping Address",
      "Opening Balance",
      "Credit Limit",
    ];
    
    // Add one sample row
    const sampleData = [
      {
        "Party Name": "John Doe",
        "Phone Number": "1234567890",
        "Email": "john@example.com",
        "Billing Address": "123 Main St, City, Country",
        "Shipping Address": "123 Main St, City, Country",
        "Opening Balance": 0,
        "Credit Limit": 10000,
      },
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    
    // Style the header row
    const range = xlsx.utils.decode_range(worksheet['!ref'] || "A1:G2");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = xlsx.utils.encode_cell({ c: C, r: 0 }); // First row
      if (!worksheet[address]) continue;
      
      worksheet[address].s = {
        fill: {
          fgColor: { rgb: "4382FF" }
        },
        font: {
          name: "Calibri",
          sz: 12,
          color: { rgb: "FFFFFF" },
          bold: true
        },
        alignment: {
          vertical: "center",
          horizontal: "center"
        }
      };
    }

    // Set column widths for nice formatting
    worksheet["!cols"] = [
      { wch: 25 }, // Party Name
      { wch: 20 }, // Phone Number
      { wch: 30 }, // Email
      { wch: 40 }, // Billing Address
      { wch: 40 }, // Shipping Address
      { wch: 20 }, // Opening Balance
      { wch: 20 }, // Credit Limit
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Parties");
    
    xlsx.writeFile(workbook, "sample_parties.xlsx");
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h3 className="text-[#E53935] font-semibold text-sm mb-2">STEP 1</h3>
        <p className="text-gray-600 text-sm mb-3">
          Create an Excel file with the following format.
        </p>
        <button 
          onClick={downloadSample}
          className="border border-[#4382FF] text-[#4382FF] px-4 py-1.5 rounded bg-white hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          Download Sample
        </button>
      </div>

      <div>
        <h3 className="text-[#E53935] font-semibold text-sm mb-2">STEP 2</h3>
        <p className="text-gray-600 text-sm">
          Upload the file (.xlsx or .xls) by clicking on the Upload File button below.
        </p>
      </div>

      <div>
        <h3 className="text-[#E53935] font-semibold text-sm mb-2">STEP 3</h3>
        <p className="text-gray-600 text-sm mb-4">
          Verify the items from the file & complete the import.
        </p>

        <div className="overflow-x-auto border border-gray-200 rounded-lg max-w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#4382FF] text-white">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Party Name</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Email</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Phone Number</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Address</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Opening Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">Party 1</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">party1@example.com</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">123456789</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">123 Main St</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">0</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">Party 2</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">party2@example.com</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">987654321</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">456 Elm St</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-700">500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
