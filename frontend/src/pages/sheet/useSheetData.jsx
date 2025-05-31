import { useState, useEffect } from 'react';

function useSheetData(spreadsheetId, range, pollInterval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sheet/sheet-data?spreadsheetId=${encodeURIComponent(spreadsheetId)}&range=${encodeURIComponent(range)}`);
      const result = await response.json();
      setData(result.data);
      setLastUpdated(result.lastUpdated);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sheet/check-updates');
      const { lastModified } = await response.json();
      
      if (!lastUpdated || new Date(lastModified) > new Date(lastUpdated)) {
        fetchData();
      }
    } catch (err) {
      console.error('Error checking for updates:', err);
    }
  };

  const updateSheetCell = async (spreadsheetId, sheetName, cellNotation, value) => {
    try {
      const response = await fetch('http://localhost:5000/api/sheet/update-cell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId,
          sheetName,
          cellNotation,
          value
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cell');
      }
      
      // Refresh data after update
      fetchData();
      return await response.json();
    } catch (err) {
      console.error('Error updating cell:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(checkForUpdates, pollInterval);
    return () => clearInterval(interval);
  }, [spreadsheetId, range]);

  return { data, loading, error, lastUpdated, updateSheetCell };
}

export default useSheetData;