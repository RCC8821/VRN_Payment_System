
const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();


router.get('/Schedule-Payment', async (req, res) => {
  try {
    // 1. FMS sheet se data
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:Z',
    });
    let fmsRows = fmsResponse.data.values || [];

    if (fmsRows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Payments sheet se PURA data
    const paymentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Payment!A2:X', // A2 se start (assuming A1 header hai)
    });
    let paymentsRows = paymentsResponse.data.values || [];

    // 3. paymentId + projectType + bookingId → array of matching rows
    const paymentMap = new Map();

    paymentsRows.forEach(row => {
      const bookingId = (row[0] || '').trim();      // A column
      const paymentId = (row[1] || '').trim();      // B column
      const projectType = (row[13] || '').trim();   // N column (index 13)

      if (paymentId && projectType && bookingId) {
        // Composite key: paymentId|projectType|bookingId
        const key = `${paymentId}|${projectType}|${bookingId}`;

        if (!paymentMap.has(key)) {
          paymentMap.set(key, []);
        }

        // Sabhi matching rows ko array mein push karo
        paymentMap.get(key).push({
          previousReceviedAmountDate: (row[20] || '').trim(), // U column (index 20)
          PreviousAmountV: (row[21] || '').trim(),            // V column (index 21)
          NextDate: (row[22] || '').trim(),                   // W column (index 22)
          previousRemark: (row[23] || '').trim(),             // X column (index 23)
        });
      }
    });

    // 4. FMS rows ko filter + map + PURA previous data add karo
    const filteredData = fmsRows
      .filter(row => {
        const qValue = (row[16] || '').toString().trim(); // Q column = BalanceToRecive
        return qValue !== '' && qValue !== '0';
      })
      .map(row => {
        const bookingId = (row[0] || '').trim();       // A column
        const paymentId = (row[1] || '').trim();       // B column
        const projectType = (row[13] || '').trim();    // N column (index 13)

        const key = `${paymentId}|${projectType}|${bookingId}`;
        const previousData = paymentMap.get(key) || []; // ARRAY milega

        return {
          Planned: (row[17] || '').trim(),             // R column
          bookingId: bookingId,
          paymentId: paymentId,
          applicantName: (row[2] || '').trim(),        // C column
          contact: (row[3] || '').trim(),              // D column
          email: (row[4] || '').trim(),                // E column
          CurrentAddress: (row[5] || '').trim(),       // F column
          agreementValue: (row[6] || '').trim(),       // G column
          bookingAmount: (row[7] || '').trim(),        // H column
          unitCode: (row[8] || '').trim(),             // I column
          block: (row[9] || '').trim(),                // J column
          unitNo: (row[10] || '').trim(),              // K column
          unitType: (row[11] || '').trim(),            // L column
          size: (row[12] || '').trim(),                // M column
          projectType: projectType,                    // N column
          Date: (row[14] || '').trim(),                // O column
          Amount: (row[15] || '').trim(),              // P column
          BalanceToRecive: (row[16] || '').trim(),     // Q column
          Actual: (row[18] || '').trim(),              // S column
          FollowUp: (row[24] || '').trim(),            // Y column

          // Payment sheet se SABHI matching rows (array)
          previousPayments: previousData,
        };
      });

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('GET /Schedule-Payment error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch schedule payment data' });
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
      Planned = '',
      bookingId = '',
      applicantName = '',
      contact = '',
      email = '',
      CurrentAddress = '',
      agreementValue = '',
      bookingAmount = '',
      unitCode = '',
      block = '',
      unitNo = '',
      unitType = '',
      size = '',
      projectType = '',
      Date: submissionDate = ''
    } = req.body;

    if (!paymentId?.trim()) {
      return res.status(400).json({ success: false, message: 'paymentId is required' });
    }

    if (!bookingId?.trim()) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const trimmedPaymentId = paymentId.trim();
    const targetBookingId = bookingId.trim();
    const normalizedStatus = (status || '').trim().toLowerCase();

    console.log(`Processing: paymentId=${trimmedPaymentId} | bookingId=${targetBookingId} | amountReceived=${amountReceived} | lastDateOfReceiving=${lastDateOfReceiving}`);

    // FMS sheet से data लाओ
    const fmsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'FMS!A8:Y',
    });

    const fmsRows = fmsResponse.data.values || [];

    // Current row ढूंढो (paymentId Column B index 1 से match)
    const fmsRowIndex = fmsRows.findIndex(row => (row[1] || '').trim() === trimmedPaymentId);

    let fmsSheetRowNum = null;
    const fmsBatchData = [];
    let followupCount = '0';
    let previousAmountReceived = 0;
    let plannedAmount = 0;

    if (fmsRowIndex !== -1) {
      fmsSheetRowNum = 8 + fmsRowIndex;
      const currentRow = fmsRows[fmsRowIndex];

      // Optional: bookingId verify
      const rowBookingId = (currentRow[0] || '').trim();
      if (rowBookingId && rowBookingId !== targetBookingId) {
        console.warn(`Booking ID mismatch in row ${fmsSheetRowNum}: expected ${targetBookingId}, found ${rowBookingId}`);
      }

      // Previous received (Column V index 21)
      previousAmountReceived = parseFloat((currentRow[21] || '').trim()) || 0;

      const newAmount = parseFloat(amountReceived) || 0;
      const totalReceived = previousAmountReceived + newAmount;

      plannedAmount = parseFloat((currentRow[16] || '').trim()) || 0; // Column Q

      // Followup count increase (Column Y index 24)
      followupCount = (currentRow[24] || '0').trim();
      let newFollowup = parseInt(followupCount, 10) || 0;
      newFollowup += 1;
      followupCount = newFollowup.toString();

      // Current row को update करो
      const updates = [
        { col: 'T', value: normalizedStatus },
        { col: 'U', value: lastDateOfReceiving || '' },
        { col: 'V', value: totalReceived.toString() },
        { col: 'W', value: nextDate || '' },
        { col: 'X', value: remark || '' },
        { col: 'Y', value: followupCount }
      ];

      updates.forEach(({ col, value }) => {
        if (value !== undefined && value !== null && value !== '') {
          fmsBatchData.push({
            range: `FMS!${col}${fmsSheetRowNum}`,
            values: [[value]]
          });
        }
      });

      // ←←← Delay / date shift logic पूरी तरह हटा दिया गया है →→→
    } else {
      followupCount = '1';
      console.log(`Payment ID not found: ${trimmedPaymentId}`);
    }

    // Timestamp
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

    // Scoring append
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Scoring!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[timestamp, targetBookingId, trimmedPaymentId, projectType || '', Planned || '', nextDate || '', followupCount, remark || '', normalizedStatus]] }
    });

    // Payment sheet append
    const paymentResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Payment!A:X' });
    const paymentRows = paymentResponse.data.values || [];
    const nextPaymentRow = paymentRows.length + 1;

    const paymentData = [
      targetBookingId, trimmedPaymentId, applicantName || '', contact || '', email || '', 
      CurrentAddress || '', agreementValue || '', bookingAmount || '', unitCode || '', block || '', 
      unitNo || '', unitType || '', size || '', projectType || '', submissionDate || '', 
      '', '', Planned || '', ''
    ];

    const paymentBatch = [{
      range: `Payment!A${nextPaymentRow}:S${nextPaymentRow}`,
      values: [paymentData]
    }];

    const indivAmount = parseFloat(amountReceived) || 0;
    [
      { col: 'U', value: lastDateOfReceiving || '' },
      { col: 'V', value: indivAmount.toString() },
      { col: 'W', value: nextDate || '' },
      { col: 'X', value: remark || '' }
    ].forEach(item => {
      if (item.value) {
        paymentBatch.push({ range: `Payment!${item.col}${nextPaymentRow}`, values: [[item.value]] });
      }
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: paymentBatch }
    });

    // FMS updates apply
    if (fmsBatchData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: fmsBatchData }
      });
    }

    // Response
    res.json({
      success: true,
      message: 'Updated successfully',
      paymentId: trimmedPaymentId,
      bookingId: targetBookingId,
      fmsRow: fmsSheetRowNum || 'Not found',
      followupCount,
      previousAmount: previousAmountReceived,
      addedAmount: parseFloat(amountReceived) || 0,
      totalReceived: previousAmountReceived + (parseFloat(amountReceived) || 0),
      plannedAmount,
      delayApplied: 'disabled'   // just for your info in response
    });

  } catch (error) {
    console.error('Error in update-Schedule-payment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});



/////////////////////////////////////////////////////////////


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
//     let currentPlannedDate = '';
//     let bookingSchedules = []; // future rows

//     if (fmsRowIndex !== -1) {
//       fmsSheetRowNum = 8 + fmsRowIndex;
//       const currentRow = fmsRows[fmsRowIndex];

//       // Optional: bookingId verify (अगर bookingId Column A में है तो)
//       const rowBookingId = (currentRow[0] || '').trim();
//       if (rowBookingId && rowBookingId !== targetBookingId) {
//         console.warn(`Booking ID mismatch in row ${fmsSheetRowNum}: expected ${targetBookingId}, found ${rowBookingId}`);
//       }

//       currentPlannedDate = (currentRow[17] || '').trim(); // Column R
//       const plannedAmountStr = (currentRow[16] || '').trim(); // Column Q
//       plannedAmount = parseFloat(plannedAmountStr) || 0;

//       // Previous received (Column V index 21)
//       previousAmountReceived = parseFloat((currentRow[21] || '').trim()) || 0;

//       const newAmount = parseFloat(amountReceived) || 0;
//       const totalReceived = previousAmountReceived + newAmount;

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

//       // Future schedules: current row से नीचे वाली सभी rows (chronological)
//       bookingSchedules = fmsRows
//         .slice(fmsRowIndex + 1) // नीचे से शुरू
//         .map((row, relIndex) => ({
//           rowIndex: fmsRowIndex + 1 + relIndex,
//           paymentId: (row[1] || '').trim(),
//           plannedDate: (row[17] || '').trim(),
//           nextDateColS: (row[18] || '').trim()
//         }))
//         .filter(sch => sch.plannedDate && sch.plannedDate.trim() !== ''); // जिनमें planned date है

//       console.log(`Found ${bookingSchedules.length} future schedules after row ${fmsSheetRowNum}`);

//       // Delay logic
//       if (lastDateOfReceiving && currentPlannedDate && bookingSchedules.length > 0) {
//         const parseDate = (str) => {
//           if (!str || typeof str !== 'string') return null;
//           const parts = str.trim().split('/');
//           if (parts.length !== 3) return null;
//           const [dd, mm, yyyy] = parts.map(n => parseInt(n, 10));
//           if (isNaN(dd) || isNaN(mm) || isNaN(yyyy)) return null;
//           const date = new Date(yyyy, mm - 1, dd);
//           return isNaN(date.getTime()) ? null : date;
//         };

//         const plannedObj = parseDate(currentPlannedDate);
//         const receivedObj = parseDate(lastDateOfReceiving);

//         if (plannedObj && receivedObj) {
//           const delayMs = receivedObj.getTime() - plannedObj.getTime();
//           const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));

//           if (delayDays > 0) {
//             console.log(`Delay detected: ${delayDays} days → shifting ${bookingSchedules.length} future planned dates`);

//             for (const sch of bookingSchedules) {
//               const oldDate = parseDate(sch.plannedDate);
//               if (oldDate) {
//                 const newDate = new Date(oldDate);
//                 newDate.setDate(newDate.getDate() + delayDays);

//                 const formattedDate = [
//                   String(newDate.getDate()).padStart(2, '0'),
//                   String(newDate.getMonth() + 1).padStart(2, '0'),
//                   newDate.getFullYear()
//                 ].join('/');

//                 fmsBatchData.push({
//                   range: `FMS!R${8 + sch.rowIndex}`,
//                   values: [[formattedDate]]
//                 });

//                 console.log(`Shifted row ${8 + sch.rowIndex} (${sch.paymentId}): ${sch.plannedDate} → ${formattedDate}`);
//               }

//               // अगर Column S (Next Date) भी shift करना चाहते हो तो यहाँ जोड़ सकते हो
//               // if (sch.nextDateColS) { ... same logic for S column }
//             }
//           } else {
//             console.log(`No delay (payment on time or early)`);
//           }
//         } else {
//           console.log(`Date parse failed: planned=${currentPlannedDate}, received=${lastDateOfReceiving}`);
//         }
//       }
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

//     // Scoring append (बाकी कोड जैसा ही)
//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Scoring!A:I',
//       valueInputOption: 'USER_ENTERED',
//       resource: { values: [[timestamp, targetBookingId, trimmedPaymentId, projectType || '', Planned || '', nextDate || '', followupCount, remark || '', normalizedStatus]] }
//     });

//     // Payment sheet append (बाकी जैसा ही)
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
//       range: `Payment!A${nextPaymentRow}:S${nextPaymentRow}`,
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
//       futureSchedulesFound: bookingSchedules.length,
//       delayApplied: 'checked'
//     });

//   } catch (error) {
//     console.error('Error in update-Schedule-payment:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// });


module.exports = router;