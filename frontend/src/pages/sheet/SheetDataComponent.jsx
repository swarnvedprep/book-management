import { useState, useEffect } from "react";
import useSheetData from "./useSheetData";
import { useNavigate } from "react-router-dom";

const SheetDataComponent = ({ spreadsheetId, range, title }) => {
  const { data, loading, error, lastUpdated, updateSheetCell } = useSheetData(
    spreadsheetId,
    range
  );
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">Error: {error}</div>;
  }

  const handleCreateOrder = (rowData) => {
    // Determine if this is app-data or manual-data format
    const isAppData = range.includes("Copy App Order");
    
    const orderData = {
      user: {
        name: isAppData ? rowData[0] : rowData[1],
        email: isAppData ? rowData[1] : rowData[9],
        phoneNumber: isAppData ? rowData[2] : rowData[11],
        alternateNumber: isAppData ? rowData[3] : rowData[12],
        pinCode: isAppData ? rowData[4] : rowData[8],
        address: isAppData ? rowData[5] : rowData[4],
        landmark: isAppData ? rowData[6] : rowData[5],
        state: isAppData ? rowData[7] : rowData[7],
        city: isAppData ? rowData[8] : rowData[6]
      },
      books: [{
        book: rowData[isAppData ? 9 : 13],
        quantity: 1
      }],
      transactionId: isAppData ? rowData[12] : `manual_${Date.now()}`,
      courier: {
        type: isAppData ? rowData[15] : rowData[23],
        charges: 0 // You might need to adjust this based on your data
      }
    };

    // Navigate to order create page with state
    navigate('/orders/create', { state: { prefillData: orderData } });
  };

  const getTrackingIdColumnIndex = () => {
    if (!data || data.length === 0) return -1;
    
    // Check if this is manual order or app order sheet
    const headers = data[0] || [];
    
    // For Manual Order sheet - "Tracking ID (Primary)"
    const manualTrackingIndex = headers.findIndex(header => 
      header === "Tracking ID (Primary)");
    
    // For Copy App Order sheet - "Tracking ID"
    const appTrackingIndex = headers.findIndex(header => 
      header === "Tracking ID");
    
    return manualTrackingIndex !== -1 ? manualTrackingIndex : appTrackingIndex;
  };

  const handleCellEdit = (rowIndex, columnIndex) => {
    setEditingCell({ rowIndex, columnIndex });
    setEditValue(data[rowIndex + 1][columnIndex] || "");
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const { rowIndex, columnIndex } = editingCell;
    
    try {
      // Row index is +1 because data[0] is header row
      // Add +1 more because Google Sheets is 1-indexed, and the first row is headers
      const sheetRowIndex = rowIndex + 2;
      
      // Convert column index to A1 notation (A, B, C, etc.)
      const columnLetter = String.fromCharCode(65 + columnIndex);
      const cellNotation = `${columnLetter}${sheetRowIndex}`;
      
      // Extract sheet name from range (e.g., "Sheet1!A1:Z" -> "Sheet1")
      const sheetName = range.split('!')[0];
      
      await updateSheetCell(spreadsheetId, sheetName, cellNotation, editValue);
      
      // Update local data to reflect the change
      const newData = JSON.parse(JSON.stringify(data)); // Deep clone
      if (!newData[rowIndex + 1]) {
        newData[rowIndex + 1] = [];
      }
      newData[rowIndex + 1][columnIndex] = editValue;
      
      // Clear editing state
      setEditingCell(null);
      setEditValue("");
    } catch (err) {
      console.error("Error updating cell:", err);
      // Handle error (could show a toast notification)
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const trackingIdColumnIndex = getTrackingIdColumnIndex();

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
        📊 {title}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Last updated:{" "}
        {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
      </p>
      <div
        className="overflow-auto max-h-[80vh] border"
        role="region"
        aria-labelledby="table-title"
        tabIndex="0"
      >
        <table
          className="min-w-full divide-y divide-gray-200 table-fixed"
          aria-describedby="table-title"
        >
          <caption id="table-title" className="sr-only">
            {title}
          </caption>
          <thead className="bg-green-600 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-16">
                S. No
              </th>
              {data[0]?.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {rowIndex + 1}
                </td>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {trackingIdColumnIndex === cellIndex && (cell === undefined || cell === null || cell === "") ? (
                      editingCell?.rowIndex === rowIndex && editingCell?.columnIndex === cellIndex ? (
                        <div className="flex items-center space-x-2 min-w-[200px]">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border border-gray-300 px-2 py-1 rounded text-sm flex-grow"
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveEdit}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCellEdit(rowIndex, cellIndex)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-xs"
                        >
                          Add Tracking ID
                        </button>
                      )
                    ) : (
                      cell || ""
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {trackingIdColumnIndex !== -1 && 
                   row[trackingIdColumnIndex] !== undefined && 
                   row[trackingIdColumnIndex] !== null && 
                   row[trackingIdColumnIndex] !== "" ? (
                    <span className="text-green-600 font-medium">Order Created</span>
                  ) : (
                    <button
                      onClick={() => handleCreateOrder(row)}
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-xs"
                    >
                      Create Order
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SheetDataComponent;