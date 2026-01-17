
const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

router.get('/Schedule-Payment', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:O',   // ← columns badha diya (A to O)
    });

    let rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const filteredData = rows
      .filter(row => row[15] && row[16] !== '')     // Booking Amount exist karta ho
      .map(row => ({
        Planned:        (row[15] || '').trim(),
        paymentId:      (row[0]  || '').trim(),
        bookingId:      (row[1]  || '').trim(),
        projectType:    (row[2]  || '').trim(),
        unitType:       (row[3]  || '').trim(),
        unitNo:         (row[4]  || '').trim(),
        block:          (row[5]  || '').trim(),
        size:           (row[6]  || '').trim(),
        unitCode:       (row[7]  || '').trim(),
        applicantName:  (row[8]  || '').trim(),
        contact:        (row[9]  || '').trim(),
        agreementValue: (row[10] || '').trim(),
        bookingAmount:  (row[11] || '').trim(),
        scheduleAmount: (row[12] || '').trim(),
        Actual:         (row[16] || '') .trim()
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Schedule-Payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schedule payment data' });
  }
});




// router.get('/bank-balance/:bankName', async (req, res) => {
//   try {
//     const { bankName } = req.params;
//     console.log('Requested Bank:', bankName);

//     // Sheet name ko single quotes mein wrap karo (safe way)
//     const range = `'${bankName}'!F3`;

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range,
//     });

//     const bankClosingBalance = response.data.values?.[0]?.[0] || 'Not Found';

//     console.log('Fetched Range:', range);
//     console.log('F3 Value:', bankClosingBalance);

//     // Hamesha success: true bhejo agar koi error nahi hai
//     res.status(200).json({
//       success: true,
//       bankName: bankName,
//       bankClosingBalance: bankClosingBalance.toString().trim(),
//     });
//   } catch (error) {
//     console.error('Bank balance API error:', error.message);
//     // Agar error hai tabhi success: false bhejo
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bank balance',
//       error: error.message,
//     });
//   }
// });




router.post('/update-reconciliation', async (req, res) => {
  console.log('Received body:', req.body); // Debug

  try {
    const { paymentDetails, bankClosingBalanceAfterPayment, status, remark } = req.body;

    if (!paymentDetails || !paymentDetails.trim()) {
      return res.status(400).json({ success: false, message: 'Payment Details is required' });
    }

    const trimmedInput = paymentDetails.trim().toLowerCase();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A7:Q',
    });

    const rows = response.data.values || [];

    const rowIndex = rows.findIndex(row => {
      const sheetValue = row[6] ? row[6].toString().trim().toLowerCase() : '';
      return sheetValue === trimmedInput;
    });

    if (rowIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Row not found with this Payment Details',
        searchedFor: paymentDetails 
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: `FMS!P${sheetRowNumber}`, values: [[bankClosingBalanceAfterPayment || '']] },
          { range: `FMS!N${sheetRowNumber}`, values: [[status || '']] },
          { range: `FMS!Q${sheetRowNumber}`, values: [[remark || '']] }
        ]
      }
    });

    // Naya part: Force recalculation by dummy write
    const bankName = rows[rowIndex][4]?.toString().trim(); // Column E (index 4) se bank name nikaalo

    if (bankName) {
      const dummyRange = `'${bankName}'!Z1`; // Unused cell Z1 mein write karo (hide kar sakte ho)

      const triggerValue = Date.now().toString(); // Chhota unique value (timestamp)

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: dummyRange,
        valueInputOption: 'RAW',
        resource: {
          values: [[triggerValue]]
        }
      });

      console.log(`Forced recalculation for ${bankName} by writing to Z1`);
    }

    res.json({ 
      success: true, 
      message: 'Reconciliation updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;