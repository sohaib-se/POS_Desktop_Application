import * as xlsx from "xlsx-js-style";

export function ImportItemsSteps() {
  const downloadSample = () => {
    const headers = [
      "Item Name",
      "Category",
      "Item Code",
      "Primary Unit",
      "Secondary Unit",
      "Conversion Rate",
      "Item Image",
      "Sale Price",
      "Wholesale Price",
      "Purchase Price",
      "Minimum Wholesale Quantity",
      "Low Threshold Quantity",
      "Opening Stock",
      "At Price",
      "As Of Date",
      "Manufacturing Date",
      "Expiry Date",
    ];
    
    // Add one sample row
    const sampleData = [
      {
        "Item Name": "Sample Item",
        "Category": "General",
        "Item Code": "ITEM-123",
        "Primary Unit": "Box",
        "Secondary Unit": "Pcs",
        "Conversion Rate": 10,
        "Item Image": "",
        "Sale Price": 100,
        "Wholesale Price": 90,
        "Purchase Price": 80,
        "Minimum Wholesale Quantity": 10,
        "Low Threshold Quantity": 5,
        "Opening Stock": 50,
        "At Price": 80,
        "As Of Date": new Date().toISOString().split('T')[0],
        "Manufacturing Date": "",
        "Expiry Date": "",
      },
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData, { header: headers });
    
    // Style the header row (row 1, cells A1 to Q1)
    const range = xlsx.utils.decode_range(worksheet['!ref'] || "A1:Q2");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = xlsx.utils.encode_cell({ c: C, r: 0 }); // First row
      if (!worksheet[address]) continue;
      
      worksheet[address].s = {
        fill: {
          fgColor: { rgb: "4382FF" } // Blue shade similar to the image
        },
        font: {
          name: "Calibri",
          sz: 12,
          color: { rgb: "FFFFFF" }, // White text
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
      { wch: 25 }, // Item Name
      { wch: 20 }, // Category
      { wch: 15 }, // Item Code
      { wch: 15 }, // Primary Unit
      { wch: 15 }, // Secondary Unit
      { wch: 18 }, // Conversion Rate
      { wch: 20 }, // Item Image
      { wch: 12 }, // Sale Price
      { wch: 15 }, // Wholesale Price
      { wch: 15 }, // Purchase Price
      { wch: 25 }, // Minimum Wholesale Quantity
      { wch: 20 }, // Low Threshold Quantity
      { wch: 15 }, // Opening Stock
      { wch: 12 }, // At Price
      { wch: 15 }, // As Of Date
      { wch: 20 }, // Manufacturing Date
      { wch: 15 }, // Expiry Date
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Items");
    
    xlsx.writeFile(workbook, "sample_items.xlsx");
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 1</h4>
        <p className="text-sm text-gray-600 mb-3">
          Create an Excel file with the following format.
        </p>
        <button
          onClick={downloadSample}
          className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors"
        >
          Download Sample
        </button>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 2</h4>
        <p className="text-sm text-gray-600 mb-3">
          Upload the file{" "}
          <span className="font-medium">(.xlsx or .xls)</span> by clicking
          on the Upload File button below.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 3</h4>
        <p className="text-sm text-gray-600">
          Verify the items from the file & complete the import.
        </p>
      </div>

      {/* Sample Table */}
      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-2 py-1">Item Name</th>
              <th className="px-2 py-1">Item Code</th>
              <th className="px-2 py-1">Sale Price</th>
              <th className="px-2 py-1">Purchase Price</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-2 py-1">Item 1</td>
              <td className="px-2 py-1">H001</td>
              <td className="px-2 py-1">10</td>
              <td className="px-2 py-1">8</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-2 py-1">Item 2</td>
              <td className="px-2 py-1">H002</td>
              <td className="px-2 py-1">15</td>
              <td className="px-2 py-1">12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
