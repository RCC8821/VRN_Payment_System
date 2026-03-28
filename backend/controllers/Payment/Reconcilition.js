const express = require('express');
const router = express.Router();
const { sheets, spreadsheetId } = require('../../config/googleSheet');


// ======================================================
// 1. GET - Pending Approvals Fetch
// URL: /api/fms/pending-approvals
// ======================================================
router.get('/Get-Reconcilition', async (req, res) => {
  try {
    if (!spreadsheetId) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Out_FMS!A7:M',
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: 'No data found',
        data: [],
      });
    }

    // Filter pending approval
    const filteredData = rows
      .filter((row) => row[11] && !row[12])
      .map((row) => ({
        UID: (row[0] || '').toString().trim(),
        Timestap: (row[1] || '').toString().trim(),
        Contractor_Vendor_Firm_Name: (row[2] || '').toString().trim(),
        PAID_AMOUNT: (row[3] || '').toString().trim(),
        BANK_DETAILS: (row[4] || '').toString().trim(),
        PAYMENT_MODE: (row[5] || '').toString().trim(),
        PAYMENT_DETAILS: (row[6] || '').toString().trim(),
        PAYMENT_DATE: (row[7] || '').toString().trim(),
        EXP_HEAD: (row[8] || '').toString().trim(),
        PLANNED_2: (row[11] || '').toString().trim(),
        ACTUAL_2: (row[12] || '').toString().trim(),
      }));

    return res.json({
      success: true,
      totalRecords: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error('GET Pending Approvals Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch',
      details: error.message,
    });
  }
});


// ======================================================
// 2. POST - Update Approval
// URL: /api/fms/pending-approvals
// ======================================================
router.post('/POST-Reconcilition', async (req, res) => {
  try {
    const body = req.body;
    const { uid, STATUS_2, BANK_CLOSING_BALANCE_2, REMARK_2 } = body;

    console.log('Received update body:', body);

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID is required',
      });
    }

    if (!spreadsheetId) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    const trimmedUid = uid.toString().trim();

    // Find row by UID
    const findResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Out_FMS!A7:A',
    });

    const values = findResponse.data.values || [];

    const rowIndex = values.findIndex((row) => {
      if (!row || row.length === 0) return false;
      const sheetValue = row[0] ? row[0].toString().trim() : '';
      return sheetValue === trimmedUid;
    });

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Row not found with this UID',
        searchedFor: uid,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    // Batch update
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `Out_FMS!N${sheetRowNumber}`,
            values: [[STATUS_2 || '']],
          },
          {
            range: `Out_FMS!P${sheetRowNumber}`,
            values: [[BANK_CLOSING_BALANCE_2 || '']],
          },
          {
            range: `Out_FMS!Q${sheetRowNumber}`,
            values: [[REMARK_2 || '']],
          },
        ],
      },
    });

    return res.json({
      success: true,
      message: 'Data updated successfully',
    });
  } catch (error) {
    console.error('POST Update Approval Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});


// ======================================================
// 3. GET - Bank Balance Fetch
// URL: /api/fms/bank-balance?bank=HDFC
// ======================================================
router.get('/bank-balance', async (req, res) => {
  try {
    const bankName = req.query.bank;

    // Validation
    if (!bankName) {
      return res.status(400).json({
        success: false,
        error: 'Bank name is required',
      });
    }

    if (!spreadsheetId) {
      return res.status(500).json({
        success: false,
        error: 'spreadsheetId is not configured',
      });
    }

    console.log('Fetching balance for bank:', bankName);

    // Bank tab se H3 cell fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${bankName}'!H3`,
    });

    const balance = response.data.values?.[0]?.[0] || '0';

    console.log('Balance found:', balance);

    return res.json({
      success: true,
      bank: bankName,
      balance: balance,
    });
  } catch (error) {
    console.error('Bank Balance Error:', error.message);

    if (
      error.message.includes('Unable to parse range') ||
      error.message.includes('not found')
    ) {
      return res.status(404).json({
        success: false,
        error: 'Bank sheet not found',
        details: `Sheet '${req.query.bank}' not found`,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bank balance',
      details: error.message,
    });
  }
});

module.exports = router;