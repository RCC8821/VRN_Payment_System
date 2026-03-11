
// const express = require('express');
// const { sheets, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();


// router.get('/Schedule-Payment', async (req, res) => {
//   try {
//     // 1. FMS sheet se data
//     const fmsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'FMS!A8:Z',
//     });
//     let fmsRows = fmsResponse.data.values || [];

//     if (fmsRows.length === 0) {
//       return res.json({ success: true, data: [] });
//     }

//     // 2. Payments sheet se PURA data
//     const paymentsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Payment!A2:X', // A2 se start (assuming A1 header hai)
//     });
//     let paymentsRows = paymentsResponse.data.values || [];

//     // 3. paymentId + projectType + bookingId → array of matching rows
//     const paymentMap = new Map();

//     paymentsRows.forEach(row => {
//       const bookingId = (row[0] || '').trim();      // A column
//       const paymentId = (row[1] || '').trim();      // B column
//       const projectType = (row[13] || '').trim();   // N column (index 13)

//       if (paymentId && projectType && bookingId) {
//         // Composite key: paymentId|projectType|bookingId
//         const key = `${paymentId}|${projectType}|${bookingId}`;

//         if (!paymentMap.has(key)) {
//           paymentMap.set(key, []);
//         }

//         // Sabhi matching rows ko array mein push karo
//         paymentMap.get(key).push({
//           previousReceviedAmountDate: (row[20] || '').trim(), // U column (index 20)
//           PreviousAmountV: (row[21] || '').trim(),            // V column (index 21)
//           NextDate: (row[22] || '').trim(),                   // W column (index 22)
//           previousRemark: (row[23] || '').trim(),             // X column (index 23)
//         });
//       }
//     });

//     // 4. FMS rows ko filter + map + PURA previous data add karo
//     const filteredData = fmsRows
//       .filter(row => {
//         const qValue = (row[16] || '').toString().trim(); // Q column = BalanceToRecive
//         return qValue !== '' && qValue !== '0';
//       })
//       .map(row => {
//         const bookingId = (row[0] || '').trim();       // A column
//         const paymentId = (row[1] || '').trim();       // B column
//         const projectType = (row[13] || '').trim();    // N column (index 13)

//         const key = `${paymentId}|${projectType}|${bookingId}`;
//         const previousData = paymentMap.get(key) || []; // ARRAY milega

//         return {
//           Planned: (row[17] || '').trim(),             // R column
//           bookingId: bookingId,
//           paymentId: paymentId,
//           applicantName: (row[2] || '').trim(),        // C column
//           contact: (row[3] || '').trim(),              // D column
//           email: (row[4] || '').trim(),                // E column
//           CurrentAddress: (row[5] || '').trim(),       // F column
//           agreementValue: (row[6] || '').trim(),       // G column
//           bookingAmount: (row[7] || '').trim(),        // H column
//           unitCode: (row[8] || '').trim(),             // I column
//           block: (row[9] || '').trim(),                // J column
//           unitNo: (row[10] || '').trim(),              // K column
//           unitType: (row[11] || '').trim(),            // L column
//           size: (row[12] || '').trim(),                // M column
//           projectType: projectType,                    // N column
//           Date: (row[14] || '').trim(),                // O column
//           Amount: (row[15] || '').trim(),              // P column
//           BalanceToRecive: (row[16] || '').trim(),     // Q column
//           Actual: (row[18] || '').trim(),              // S column
//           FollowUp: (row[24] || '').trim(),            // Y column

//           // Payment sheet se SABHI matching rows (array)
//           previousPayments: previousData,
//         };
//       });

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('GET /Schedule-Payment error:', error.message);
//     res.status(500).json({ success: false, error: 'Failed to fetch schedule payment data' });
//   }
// });





// router.post('/update-Schedule-payment', async (req, res) => {
//   try {
//     const {
//       paymentId = '',
//       status = '',
//       lastDateOfReceiving = '',
//       amountReceived = '',
//       nextDate = '',
//       remark = '',
//       Planned = '',
//       bookingId = '',
//       applicantName = '',
//       contact = '',
//       email = '',
//       CurrentAddress = '',
//       agreementValue = '',
//       bookingAmount = '',
//       unitCode = '',
//       block = '',
//       unitNo = '',
//       unitType = '',
//       size = '',
//       projectType = '',
//       Date: submissionDate = ''
//     } = req.body;

//     if (!paymentId?.trim()) {
//       return res.status(400).json({ success: false, message: 'paymentId is required' });
//     }

//     if (!bookingId?.trim()) {
//       return res.status(400).json({ success: false, message: 'bookingId is required' });
//     }

//     const trimmedPaymentId = paymentId.trim();
//     const targetBookingId = bookingId.trim();
//     const normalizedStatus = (status || '').trim().toLowerCase();

//     console.log(`Processing: paymentId=${trimmedPaymentId} | bookingId=${targetBookingId} | amountReceived=${amountReceived} | lastDateOfReceiving=${lastDateOfReceiving}`);

//     // FMS sheet से data लाओ
//     const fmsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'FMS!A8:Y',
//     });

//     const fmsRows = fmsResponse.data.values || [];

//     // Current row ढूंढो (paymentId Column B index 1 से match)
//     const fmsRowIndex = fmsRows.findIndex(row => (row[1] || '').trim() === trimmedPaymentId);

//     let fmsSheetRowNum = null;
//     const fmsBatchData = [];
//     let followupCount = '0';
//     let previousAmountReceived = 0;
//     let plannedAmount = 0;

//     if (fmsRowIndex !== -1) {
//       fmsSheetRowNum = 8 + fmsRowIndex;
//       const currentRow = fmsRows[fmsRowIndex];

//       // Optional: bookingId verify
//       const rowBookingId = (currentRow[0] || '').trim();
//       if (rowBookingId && rowBookingId !== targetBookingId) {
//         console.warn(`Booking ID mismatch in row ${fmsSheetRowNum}: expected ${targetBookingId}, found ${rowBookingId}`);
//       }

//       // Previous received (Column V index 21)
//       previousAmountReceived = parseFloat((currentRow[21] || '').trim()) || 0;

//       const newAmount = parseFloat(amountReceived) || 0;
//       const totalReceived = previousAmountReceived + newAmount;

//       plannedAmount = parseFloat((currentRow[16] || '').trim()) || 0; // Column Q

//       // Followup count increase (Column Y index 24)
//       followupCount = (currentRow[24] || '0').trim();
//       let newFollowup = parseInt(followupCount, 10) || 0;
//       newFollowup += 1;
//       followupCount = newFollowup.toString();

//       // Current row को update करो
//       const updates = [
//         { col: 'T', value: normalizedStatus },
//         { col: 'U', value: lastDateOfReceiving || '' },
//         { col: 'V', value: totalReceived.toString() },
//         { col: 'W', value: nextDate || '' },
//         { col: 'X', value: remark || '' },
//         { col: 'Y', value: followupCount }
//       ];

//       updates.forEach(({ col, value }) => {
//         if (value !== undefined && value !== null && value !== '') {
//           fmsBatchData.push({
//             range: `FMS!${col}${fmsSheetRowNum}`,
//             values: [[value]]
//           });
//         }
//       });

//       // ←←← Delay / date shift logic पूरी तरह हटा दिया गया है →→→
//     } else {
//       followupCount = '1';
//       console.log(`Payment ID not found: ${trimmedPaymentId}`);
//     }

//     // Timestamp
//     const now = new Date();
//     const timestamp = [
//       String(now.getDate()).padStart(2, '0'),
//       String(now.getMonth() + 1).padStart(2, '0'),
//       now.getFullYear()
//     ].join('/') + ' ' + [
//       String(now.getHours()).padStart(2, '0'),
//       String(now.getMinutes()).padStart(2, '0'),
//       String(now.getSeconds()).padStart(2, '0')
//     ].join(':');

//     // Scoring append
//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Scoring!A:I',
//       valueInputOption: 'USER_ENTERED',
//       resource: { values: [[timestamp, targetBookingId, trimmedPaymentId, projectType || '', Planned || '', nextDate || '', followupCount, remark || '', normalizedStatus]] }
//     });

//     // Payment sheet append
//     const paymentResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Payment!A:X' });
//     const paymentRows = paymentResponse.data.values || [];
//     const nextPaymentRow = paymentRows.length + 1;

//     const paymentData = [
//       targetBookingId, trimmedPaymentId, applicantName || '', contact || '', email || '', 
//       CurrentAddress || '', agreementValue || '', bookingAmount || '', unitCode || '', block || '', 
//       unitNo || '', unitType || '', size || '', projectType || '', submissionDate || '', 
//       '', '', Planned || '', ''
//     ];

//     const paymentBatch = [{
//       range: `Payment!A7${nextPaymentRow}:S${nextPaymentRow}`,
//       values: [paymentData]
//     }];

//     const indivAmount = parseFloat(amountReceived) || 0;
//     [
//       { col: 'U', value: lastDateOfReceiving || '' },
//       { col: 'V', value: indivAmount.toString() },
//       { col: 'W', value: nextDate || '' },
//       { col: 'X', value: remark || '' }
//     ].forEach(item => {
//       if (item.value) {
//         paymentBatch.push({ range: `Payment!${item.col}${nextPaymentRow}`, values: [[item.value]] });
//       }
//     });

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: { valueInputOption: 'USER_ENTERED', data: paymentBatch }
//     });

//     // FMS updates apply
//     if (fmsBatchData.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: fmsBatchData }
//       });
//     }

//     // Response
//     res.json({
//       success: true,
//       message: 'Updated successfully',
//       paymentId: trimmedPaymentId,
//       bookingId: targetBookingId,
//       fmsRow: fmsSheetRowNum || 'Not found',
//       followupCount,
//       previousAmount: previousAmountReceived,
//       addedAmount: parseFloat(amountReceived) || 0,
//       totalReceived: previousAmountReceived + (parseFloat(amountReceived) || 0),
//       plannedAmount,
//       delayApplied: 'disabled'   // just for your info in response
//     });

//   } catch (error) {
//     console.error('Error in update-Schedule-payment:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// });




// router.get('/project-bank-mapping', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!A2:B100',   // adjust row limit if needed (A=Project, B=Bank A/c)
//     });

//     const rows = response.data.values || [];

//     if (rows.length === 0) {
//       return res.json({
//         success: true,
//         data: [],
//         message: 'No project data found in Project_Data sheet'
//       });
//     }

//     const projectBankList = rows
//       .filter(row => row && row[0] && row[0].toString().trim() !== '') // project name should exist
//       .map(row => ({
//         project: (row[0] || '').trim(),
//         bankAccount: (row[1] || '').trim() || '—',
//       }))
//       .sort((a, b) => a.project.localeCompare(b.project)); // alphabetical sort

//     // Project name → Bank account quick lookup object
//     const projectToBankMap = {};
//     projectBankList.forEach(item => {
//       projectToBankMap[item.project] = item.bankAccount;
//     });

//     res.json({
//       success: true,
//       data: projectBankList,
//       projectToBankMap,
//       count: projectBankList.length
//     });

//   } catch (error) {
//     console.error('GET /project-bank-mapping error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch project-bank mapping',
//       details: error.message
//     });
//   }
// });


// module.exports = router;





//////// try  /////

const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();




// router.get('/Schedule-Payment', async (req, res) => {
//   try {
//     const fmsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'FMS!A8:Z',
//     });
//     let fmsRows = fmsResponse.data.values || [];

//     if (fmsRows.length === 0) {
//       return res.json({ success: true, data: [] });
//     }

//     const paymentsResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Payment!A2:Y',
//     });
//     let paymentsRows = paymentsResponse.data.values || [];

//     const paymentMap = new Map();

//     paymentsRows.forEach(row => {
//       if (row.length < 15) return;

//       const bookingId = (row[0] || '').trim();
//       const paymentId = (row[1] || '').trim();

//       if (!bookingId || !paymentId) return;

//       const key = `${paymentId}|${bookingId}`;

//       if (!paymentMap.has(key)) {
//         paymentMap.set(key, []);
//       }

//       const amountStr = (row[22] || '').trim().replace(/[^0-9.-]/g, '');
//       const amount = parseFloat(amountStr);

//       if (!isNaN(amount) && amount > 0) {
//         paymentMap.get(key).push({
//           previousReceviedAmountDate: (row[21] || '').trim(),
//           PreviousAmount: amountStr || '0',
//           NextDate: (row[23] || '').trim(),
//           previousRemark: (row[24] || '').trim(),
//         });
//       }
//     });

//     const filteredData = fmsRows
//       .filter(row => row && row.length > 17)
//       .map(row => {
//         const bookingId = (row[0] || '').trim();
//         const paymentId = (row[1] || '').trim();

//         const key = `${paymentId}|${bookingId}`;
//         const previousPayments = paymentMap.get(key) || [];

//         return {
//           Planned: (row[18] || '').trim(),
//           bookingId,
//           paymentId,
//           applicantName: (row[2] || '').trim(),
//           contact: (row[3] || '').trim(),
//           email: (row[4] || '').trim(),
//           CurrentAddress: (row[5] || '').trim(),
//           agreementValue: (row[6] || '').trim(),
//           bookingAmount: (row[7] || '').trim(),
//           Project: (row[8] || '').trim(),
//           unitCode: (row[9] || '').trim(),
//           block: (row[10] || '').trim(),
//           unitNo: (row[11] || '').trim(),
//           unitType: (row[12] || '').trim(),
//           size: (row[13] || '').trim(),
//           projectType: (row[14] || '').trim(),
//           Date: (row[15] || '').trim(),
//           Amount: (row[16] || '').trim(),
//           BalanceToRecive: (row[17] || '').trim(),
//           Actual: (row[18] || '').trim(),
//           FollowUp: (row[25] || '').trim(),

//           previousPayments,
//         };
//       });

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('GET /Schedule-Payment error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch schedule payment data',
//       details: error.message,
//     });
//   }
// });


router.get('/Schedule-Payment', async (req, res) => {
  try {
    // 1. Fetch FMS data (main source)
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:Z',
    });
    let fmsRows = fmsResponse.data.values || [];

    if (fmsRows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Fetch Payment sheet → previous payments
    const paymentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Payment!A2:Y',
    });
    let paymentsRows = paymentsResponse.data.values || [];

    const paymentMap = new Map();

    paymentsRows.forEach(row => {
      if (row.length < 25) return; // safety - up to col Y (index 24)

      const bookingId = (row[0] || '').trim();   // A - Booking ID
      const paymentId  = (row[1] || '').trim();  // B - Payment ID

      if (!bookingId || !paymentId) return;

      const key = `${paymentId}|${bookingId}`;

      if (!paymentMap.has(key)) {
        paymentMap.set(key, []);
      }

      const amountStr = (row[22] || '').trim().replace(/[^0-9.-]/g, ''); // W
      const amount = parseFloat(amountStr);

      if (!isNaN(amount) && amount > 0) {
        paymentMap.get(key).push({
          previousReceviedAmountDate: (row[21] || '').trim(), // V
          PreviousAmount: amountStr || '0',
          NextDate: (row[23] || '').trim(),                   // X
          previousRemark: (row[24] || '').trim(),             // Y
        });
      }
    });

    // 3. Fetch Scoring sheet → follow-up history
    const scoringResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Scoring!A2:I',
    });
    let scoringRows = scoringResponse.data.values || [];

    const scoringMap = new Map();

    scoringRows.forEach(row => {
      if (row.length < 9) return; // up to col I (index 8)

      const bookingId   = (row[1] || '').trim();   // B
      const paymentId   = (row[2] || '').trim();   // C

      if (!bookingId || !paymentId) return;

      const key = `${paymentId}|${bookingId}`;

      if (!scoringMap.has(key)) {
        scoringMap.set(key, []);
      }

      scoringMap.get(key).push({
        timestamp:          (row[0] || '').trim(),   // A
        schedules:          (row[3] || '').trim(),   // D
        dateOfFollowup:     (row[4] || '').trim(),   // E
        nextDateOfFollowup: (row[5] || '').trim(),   // F
        followupCount:      (row[6] || '').trim(),   // G
        remark:             (row[7] || '').trim(),   // H
        status:             (row[8] || '').trim(),   // I
      });
    });

    // 4. Combine + filter where BalanceToRecive !== '0' and not empty
    const filteredData = fmsRows
      .filter(row => {
        // BalanceToRecive is in column R → index 17
        const balanceStr = (row[17] || '').trim();
        
        // Skip if empty or exactly "0" (also handles "0.00", " ₹0 ", etc.)
        if (!balanceStr || balanceStr === '0' || balanceStr === '0.00' || balanceStr === '₹0') {
          return false;
        }

        // Optional: skip if it's not a valid number
        const balanceNum = parseFloat(balanceStr.replace(/[^0-9.-]/g, ''));
        return !isNaN(balanceNum) && balanceNum > 0;
      })
      .map(row => {
        const bookingId = (row[0] || '').trim();
        const paymentId = (row[1] || '').trim();

        const key = `${paymentId}|${bookingId}`;

        return {
          Planned:        (row[18] || '').trim(),
          bookingId,
          paymentId,
          applicantName:  (row[2] || '').trim(),
          contact:        (row[3] || '').trim(),
          email:          (row[4] || '').trim(),
          CurrentAddress: (row[5] || '').trim(),
          agreementValue: (row[6] || '').trim(),
          bookingAmount:  (row[7] || '').trim(),
          Project:        (row[8] || '').trim(),
          unitCode:       (row[9] || '').trim(),
          block:          (row[10] || '').trim(),
          unitNo:         (row[11] || '').trim(),
          unitType:       (row[12] || '').trim(),
          size:           (row[13] || '').trim(),
          projectType:    (row[14] || '').trim(),
          Date:           (row[15] || '').trim(),
          Amount:         (row[16] || '').trim(),
          BalanceToRecive:(row[17] || '').trim(),
          Actual:         (row[18] || '').trim(),
          FollowUp:       (row[25] || '').trim(),

          previousPayments: paymentMap.get(key) || [],
          followUpHistory:  scoringMap.get(key) || [],
        };
      });

    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('GET /Schedule-Payment error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule payment data',
      details: error.message,
    });
  }
});


router.post('/update-Schedule-payment', async (req, res) => {
  try {
    const {
      paymentId = '',
      status = '',
      lastDateOfReceiving = '',
      amountReceived = '',
      nextDate = '',
      remark = '',
      bankName = '',
      paymentMode = '',
      paymentDetails = '',
      Planned = '',
      bookingId = '',
      applicantName = '',
      contact = '',
      email = '',
      CurrentAddress = '',
      agreementValue = '',
      bookingAmount = '',
      Project_Name = '',
      unitCode = '',
      block = '',
      unitNo = '',
      unitType = '',
      size = '',
      projectType = '',
      Date: submissionDate = ''
    } = req.body;

    if (!paymentId?.trim() || !bookingId?.trim()) {
      return res.status(400).json({ success: false, message: 'paymentId और bookingId जरूरी हैं' });
    }

    console.log('Request body:', req.body);  // ← यहाँ चेक करो lastDateOfReceiving क्या आ रहा है

    const trimmedPaymentId = paymentId.trim();
    const targetBookingId = bookingId.trim();
    const normalizedStatus = (status || '').trim().toLowerCase();

    console.log(`Processing: paymentId=${trimmedPaymentId} | bookingId=${targetBookingId} | status=${normalizedStatus}`);

    let effectiveNextDate = (nextDate || '').trim();
    const doneStatuses = ['done', 'completed', 'paid', 'complete'];
    const isDone = doneStatuses.includes(normalizedStatus);

    if (isDone) {
      effectiveNextDate = '-';
      console.log('Status is DONE → Next Date forced to "-"');
    } else if (
      (normalizedStatus === 'partial' || normalizedStatus === 'pending') &&
      !effectiveNextDate.trim()
    ) {
      console.warn(`Warning: ${normalizedStatus} status but nextDate is empty`);
    }

    // Partial/Pending में lastDateOfReceiving अनिवार्य बनाने के लिए (optional - uncomment अगर चाहो)
    // if ((normalizedStatus === 'partial' || normalizedStatus === 'pending') && !lastDateOfReceiving?.trim()) {
    //   return res.status(400).json({ success: false, message: 'Partial या Pending में Last Date of Receiving भरना जरूरी है' });
    // }

    // 1. FMS अपडेट
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:Z',
    });

    const fmsRows = fmsResponse.data.values || [];
    const fmsRowIndex = fmsRows.findIndex(row => (row[1] || '').trim() === trimmedPaymentId);

    let fmsRowNum = null;
    const fmsUpdates = [];
    let followupCount = '0';

    if (fmsRowIndex !== -1) {
      fmsRowNum = 8 + fmsRowIndex;
      const row = fmsRows[fmsRowIndex];

      const prevReceived = parseFloat(row[22] || '0') || 0;  // W - Total Received
      const newAmount = parseFloat(amountReceived) || 0;
      const totalReceived = prevReceived + newAmount;

      followupCount = (row[25] || '0').trim();  // Z
      let newFollowup = parseInt(followupCount, 10) || 0;
      newFollowup += 1;
      followupCount = newFollowup.toString();

      const fields = [
        { col: 'U', val: normalizedStatus },
        { col: 'V', val: lastDateOfReceiving.trim() || '' },  // ← अब trim करके भेजो, blank भी update हो सकता है अगर चाहो
        { col: 'W', val: totalReceived.toString() },
        { col: 'X', val: effectiveNextDate },
        { col: 'Y', val: remark?.trim() || '' },
        { col: 'Z', val: followupCount }
      ];

      fields.forEach(({ col, val }) => {
        // V column (lastDate) को blank होने पर भी update करने दो अगर value '' है
        // अगर blank skip करना है तो पुरानी condition रख सकते हो
        fmsUpdates.push({
          range: `FMS!${col}${fmsRowNum}`,
          values: [[val]]
        });
      });
    } else {
      followupCount = '1';
      console.log(`Payment ID not found in FMS: ${trimmedPaymentId}`);
    }

    // 2. Payment sheet APPEND
    if (normalizedStatus !== 'pending') {
      const paymentRow = [
        targetBookingId,
        trimmedPaymentId,
        applicantName || '',
        contact || '',
        email || '',
        CurrentAddress || '',
        agreementValue || '',
        bookingAmount || '',
        Project_Name || '',
        unitCode || '',
        block || '',
        unitNo || '',
        unitType || '',
        size || '',
        projectType.trim() || '',
        Planned || '',
        normalizedStatus || '',
        '',                                 // R
        bankName?.trim() || '',
        paymentMode?.trim() || '',
        paymentDetails?.trim() || '',
        lastDateOfReceiving.trim() || '',   // V - Last Date of Receiving (यहाँ date आनी चाहिए)
        amountReceived || '0',              // W - Amount
        effectiveNextDate,                  // X - Next Date
        remark?.trim() || ''                // Y - Remark
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Payment!A:Y',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [paymentRow] }
      });

      console.log(`Payment row appended for status: ${normalizedStatus}`);
    } else {
      console.log(`Skipping Payment append (pending)`);
    }

    // 3. Scoring append (बाकी वैसा ही)
    const shouldLogToScoring = normalizedStatus === 'pending' ||
      (fmsRowIndex !== -1 && followupCount !== '0' && followupCount !== '1');

    if (shouldLogToScoring) {
      const now = new Date();
      const timestamp = [
        String(now.getDate()).padStart(2, '0'),
        String(now.getMonth() + 1).padStart(2, '0'),
        now.getFullYear()
      ].join('/') + ' ' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
      ].join(':');

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Scoring!A:I',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            timestamp,
            targetBookingId,
            trimmedPaymentId,
            projectType || '',
            Planned || '',
            effectiveNextDate,
            followupCount,
            remark || '',
            normalizedStatus
          ]]
        }
      });
    }

    // 4. FMS batch update
    if (fmsUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: fmsUpdates
        }
      });
    }

    res.json({
      success: true,
      message: 'Payment action recorded successfully',
      paymentId: trimmedPaymentId,
      bookingId: targetBookingId,
      fmsRow: fmsRowNum || 'Not found',
      followupCount,
      status: normalizedStatus,
      nextDate: effectiveNextDate,
      lastDateReceived: lastDateOfReceiving || 'Not provided'
    });

  } catch (error) {
    console.error('POST /update-Schedule-payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


router.get('/project-bank-mapping', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A2:B100',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No project data found in Project_Data sheet'
      });
    }

    const projectBankList = rows
      .filter(row => row && row[0] && row[0].toString().trim() !== '')
      .map(row => ({
        project: (row[0] || '').trim(),
        bankAccount: (row[1] || '').trim() || '—',
      }))
      .sort((a, b) => a.project.localeCompare(b.project));

    const projectToBankMap = {};
    projectBankList.forEach(item => {
      projectToBankMap[item.project] = item.bankAccount;
    });

    res.json({
      success: true,
      data: projectBankList,
      projectToBankMap,
      count: projectBankList.length
    });

  } catch (error) {
    console.error('GET /project-bank-mapping error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project-bank mapping',
      details: error.message
    });
  }
});

module.exports = router;