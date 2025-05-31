const { getSheetData, updateSheetData } = require('../googleSheetsService');

let cache = {
  data: null,
  lastUpdated: null,
  lastModified: null
};

const fetchSheetData = async (req, res) => {
  console.log('Fetching data from Google Sheets...');
    
  try {
    const { spreadsheetId, range } = req.query;
    
    if (!spreadsheetId || !range) {
      return res.status(400).json({ error: 'Missing spreadsheetId or range' });
    }

    const data = await getSheetData(spreadsheetId, range);
    cache = {
      data,
      lastUpdated: new Date(),
      lastModified: new Date()
    };
    
    res.json({ data, lastUpdated: cache.lastUpdated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkForUpdates = (req, res) => {
  console.log('Checking for updates...');
    
  res.json({
    lastUpdated: cache.lastUpdated,
    lastModified: cache.lastModified
  });
};

const updateSheetCell = async (req, res) => {
  console.log('Updating sheet cell...');
  
  try {
    const { spreadsheetId, sheetName, cellNotation, value } = req.body;
    
    if (!spreadsheetId || !sheetName || !cellNotation) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    await updateSheetData(spreadsheetId, sheetName, cellNotation, value);
  
    cache.lastModified = new Date();
    
    res.json({ 
      success: true, 
      message: `Cell ${cellNotation} updated successfully`,
      updatedAt: cache.lastModified
    });
  } catch (error) {
    console.error('Error updating cell:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchSheetData,
  checkForUpdates,
  updateSheetCell
};