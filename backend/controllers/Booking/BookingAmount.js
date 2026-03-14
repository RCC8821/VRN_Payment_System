
// const express = require('express');
// const { sheets, spreadsheetId } = require('../../config/googleSheet');
// const router = express.Router();

// router.get('/Actual-booking-Amount', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Bookings!A2:AH',
//     });

//     let data = response.data.values || [];
//     console.log('Total data rows:', data.length);

//     const filteredData = data.map(row => ({
//       id: row[0] || '',
//       applicationDate: row[1] || '',
//       applicantName: row[2] || '',
//       fatherHusbandName: row[3] || '',
//       contact: row[4] || '',
//       email: row[5] || '',
//       currentAddress: row[6] || '',
//       panCardNumber: row[7] || '',
//       aadharCardNumber: row[8] || '',
//       project: row[9] || '',
//       product: row[10] || '',
//       block: row[11] || '',
//       unitNo: row[12] || '',
//       unitType: row[13] || '',
//       size: row[14] || '',
//       unitCode: row[15] || '',
//       basicPrice: row[16] || '',
//       discount: row[17] || '',
//       waterCharges: row[18] || '',
//       electricalCharges: row[19] || '',
//       maintenance: row[20] || '',
//       parkFacingCharges: row[21] || '',
//       cornerFacingCharges: row[22] || '',
//       gst: row[23] || '',
//       agreementValue: row[24] || '',
//       bookingAmount: row[25] || '',
//       balanceToReceive: row[26] || '',
//       paymentType: row[27] || '',
//       numberOfSchedules: row[28] || '',
//       invoiceNumber: row[29] || '',
//       pdfUrl: row[30] || '',
//       unitSoldThrough: row[31] || '',
//       remark: row[32] || '',
//       plannedDate: row[33] || ''
//     }));

//     console.log('TOTAL RECORDS:', filteredData.length);

//     res.json({
//       success: true,
//       count: filteredData.length,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch booking data',
//       details: error.message
//     });
//   }
// });

// module.exports = router;




const express = require('express');
const { sheets, spreadsheetId } = require('../../config/googleSheet');
const router = express.Router();

// ───────────────────────────────────────────────
// Column Mapping (बाद में यहीं से बदल सकते हो)
// Key: frontend से आने वाला field name (case-sensitive)
// Value: Google Sheet का column letter (AI, AJ, etc.)
// ───────────────────────────────────────────────
const PAYMENT_COLUMN_MAP = {
  status: 'AI',
  Bank_Name: 'AJ',
  Payment_Mode: 'AK',
  Payment_Details: 'AL',
  Payment_Date: 'AM',
  Amount_Received: 'AN',
  CGST: 'AO',
  SGST: 'AP',
  Net_Amount: 'AQ',
  Remark: 'AR'
  // अगर बाद में कोई नया field जोड़ना हो तो बस यहीं ऐड कर दो
  // जैसे: Payment_Type: 'AS'
};

router.get('/Actual-booking-Amount', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A2:AI',
    });

    let data = response.data.values || [];
    console.log('Total data rows:', data.length);

    const filteredData = data
    .filter((row2)=>{
      const filterStatus =  row2[34] 
      const data = filterStatus !== "Done"
      console.log(data)
      return data
    })
    
    .map(row => ({
      id: row[0] || '',
      applicationDate: row[1] || '',
      applicantName: row[2] || '',
      fatherHusbandName: row[3] || '',
      contact: row[4] || '',
      email: row[5] || '',
      currentAddress: row[6] || '',
      panCardNumber: row[7] || '',
      aadharCardNumber: row[8] || '',
      project: row[9] || '',
      product: row[10] || '',
      block: row[11] || '',
      unitNo: row[12] || '',
      unitType: row[13] || '',
      size: row[14] || '',
      unitCode: row[15] || '',
      basicPrice: row[16] || '',
      discount: row[17] || '',
      waterCharges: row[18] || '',
      electricalCharges: row[19] || '',
      maintenance: row[20] || '',
      parkFacingCharges: row[21] || '',
      cornerFacingCharges: row[22] || '',
      gst: row[23] || '',
      agreementValue: row[24] || '',
      bookingAmount: row[25] || '',
      balanceToReceive: row[26] || '',
      paymentType: row[27] || '',
      numberOfSchedules: row[28] || '',
      invoiceNumber: row[29] || '',
      pdfUrl: row[30] || '',
      unitSoldThrough: row[31] || '',
      remark: row[32] || '',
      plannedDate: row[33] || ''
    }));

    console.log('TOTAL RECORDS:', filteredData.length);

    res.json({
      success: true,
      count: filteredData.length,
      data: filteredData
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking data',
      details: error.message
    });
  }
});

// POST API - अब column letters hardcode नहीं हैं
router.post('/update-booking-payment', async (req, res) => {
  try {
    const {
      bookingId = '',
      // बाकी fields
      status = '',
      Bank_Name = '',
      Payment_Mode = '',
      Payment_Details = '',
      Payment_Date = '',
      Amount_Received = '',
      CGST = '',
      SGST = '',
      Net_Amount = '',
      Remark = ''
    } = req.body;

    if (!bookingId?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'bookingId भेजना जरूरी है (column A का value)'
      });
    }

    const trimmedBookingId = bookingId.trim();
    console.log('Payment update request for:', trimmedBookingId);

    // 1. Row ढूंढो
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bookings!A:AR',  // AR तक लाओ (या जितना जरूरी हो)
    });

    const rows = getRes.data.values || [];
    if (rows.length < 2) {
      return res.status(404).json({ success: false, message: 'No data in Bookings' });
    }

    let targetRow = null;
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][0] || '').trim() === trimmedBookingId) {
        targetRow = i + 1;  // sheet row number
        break;
      }
    }

    if (!targetRow) {
      return res.status(404).json({
        success: false,
        message: `Booking ${trimmedBookingId} नहीं मिला`
      });
    }

    // 2. Update करने वाले fields तैयार करो
    const updates = [];

    // हर field को उसके column में map करो
    if (status !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.status}${targetRow}`,
        values: [[status.trim() || '']]
      });
    }
    if (Bank_Name !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Bank_Name}${targetRow}`,
        values: [[Bank_Name.trim() || '']]
      });
    }
    if (Payment_Mode !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Payment_Mode}${targetRow}`,
        values: [[Payment_Mode.trim() || '']]
      });
    }
    if (Payment_Details !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Payment_Details}${targetRow}`,
        values: [[Payment_Details.trim() || '']]
      });
    }
    if (Payment_Date !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Payment_Date}${targetRow}`,
        values: [[Payment_Date.trim() || '']]
      });
    }
    if (Amount_Received !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Amount_Received}${targetRow}`,
        values: [[Amount_Received.trim() || '0']]
      });
    }
    if (CGST !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.CGST}${targetRow}`,
        values: [[CGST.trim() || '0']]
      });
    }
    if (SGST !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.SGST}${targetRow}`,
        values: [[SGST.trim() || '0']]
      });
    }
    if (Net_Amount !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Net_Amount}${targetRow}`,
        values: [[Net_Amount.trim() || '0']]
      });
    }
    if (Remark !== undefined) {
      updates.push({
        range: `Bookings!${PAYMENT_COLUMN_MAP.Remark}${targetRow}`,
        values: [[Remark.trim() || '']]
      });
    }

    // अगर कुछ भी update करने को नहीं है
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'कोई payment field नहीं भेजा गया'
      });
    }

    // 3. Batch update (एक साथ कई cells update होते हैं - efficient)
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates.map(u => ({
          range: u.range,
          majorDimension: 'ROWS',
          values: u.values
        }))
      }
    });

    console.log(`Updated row ${targetRow} with ${updates.length} fields`);

    res.json({
      success: true,
      message: 'Payment details updated',
      bookingId: trimmedBookingId,
      updatedRow: targetRow,
      updatedFields: updates.map(u => u.range.split('!')[1].charAt(0))  // जैसे AI, AJ etc.
    });

  } catch (error) {
    console.error('Update error:', error.message);
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
      range: 'Project_Data!B2:B',  // सिर्फ B कॉलम
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No project data found'
      });
    }

    // Clean function: brackets और उनके अंदर का सब हटाओ + trim + खाली हटाओ
    const cleanProjectName = (str) => {
      if (!str) return '';
      let cleaned = str.toString().trim();
      // Remove anything like (xxx) at the end, including just ()
      cleaned = cleaned.replace(/\s*\([^()]*\)\s*$/, '');  // अंत में (कुछ भी) हटाओ
      cleaned = cleaned.replace(/\s*\(\)\s*$/, '');        // अगर सिर्फ () बचा हो
      cleaned = cleaned.trim();                            // extra spaces हटाओ
      return cleaned;
    };

    const projectList = rows
      .map(row => cleanProjectName(row[0]))   // row[0] = B कॉलम
      .filter(name => name !== '')             // खाली cells हटाओ
      .sort((a, b) => a.localeCompare(b));     // A to Z sort

    // Optional: duplicates हटाना चाहो तो (ज्यादातर cases में अच्छा रहता है)
    // const uniqueProjects = [...new Set(projectList)];

    // Response structure पहले जैसा रखा (frontend dropdown safe रहेगा)
    const cleanedData = projectList.map(project => ({
      project: project,   // अब सिर्फ "My City A/c", "VRN INC HDFC A/C" आदि आएगा
    }));

    res.json({
      success: true,
      data: cleanedData,
      projectToBankMap: {},   // खाली रखा (अगर frontend इस्तेमाल नहीं करता)
      count: cleanedData.length
    });

  } catch (error) {
    console.error('GET /project-bank-mapping error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project list',
      details: error.message
    });
  }
});

module.exports = router;