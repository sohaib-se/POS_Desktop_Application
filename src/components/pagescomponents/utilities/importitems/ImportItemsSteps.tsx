export function ImportItemsSteps() {
  return (
    <div>
      <div className="mb-6">
        <h4 className="text-sm font-medium text-[#E53935] mb-2">STEP 1</h4>
        <p className="text-sm text-gray-600 mb-3">
          Create an Excel file with the following format.
        </p>
        <button className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
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
