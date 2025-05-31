const express = require('express');
const router = express.Router();
const { fetchSheetData, checkForUpdates, updateSheetCell } = require('../controllers/sheetDataController');

// GET /sheet-data - Fetch data from Google Sheet
router.get('/sheet-data', fetchSheetData);

// GET /check-updates - Check for updates in the sheet
router.get('/check-updates', checkForUpdates);

// POST /update-cell - Update a specific cell in the sheet
router.post('/update-cell', updateSheetCell);

module.exports = router;