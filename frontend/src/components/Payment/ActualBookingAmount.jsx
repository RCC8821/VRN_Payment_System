
import React, { useMemo, useState, useEffect } from 'react';
import { 
  useGetActualBookingsQuery,
  useUpdateBookingPaymentMutation 
} from '../../features/SchedulePayment/ActualBookingSlice';

import { 
  useGetProjectBankMappingQuery 
} from '../../features/SchedulePayment/SchedulePaymentSlice';

import { FaPencilAlt } from 'react-icons/fa';

const statusOptions = [' Select','Done', 'Failed'];
const paymentModeOptions = ['Cash', 'Cheque', 'NEFT', 'RTGS',];

const gstSlabs = [
  { label: 'No GST (0%)', value: 0 },
  { label: '5%', value: 5 },
  { label: '12%', value: 12 },
  { label: '18%', value: 18 },
];

const emptyForm = {
  status: '',
  Bank_Name: '',
  Payment_Mode: '',
  Payment_Details: '',
  Payment_Date: '',
  Amount_Received: '',
  CGST: '',
  SGST: '',
  Net_Amount: '',
  Remark: '',
};

const ActualBookingAmount = () => {
  const { data: bookings = [], isLoading, isError, error, refetch } =
    useGetActualBookingsQuery();

  const [updatePayment, { isLoading: isUpdating, isSuccess, error: updateError }] =
    useUpdateBookingPaymentMutation();

  const { 
    data: bankMappingData, 
    isLoading: isBankLoading,
    isError: isBankError,
    error: bankError
  } = useGetProjectBankMappingQuery();

  useEffect(() => {
    console.log("Bank Mapping API Full Response:", bankMappingData);
    console.log("Is Bank Data Loading:", isBankLoading);
    console.log("Bank API Error (if any):", isBankError ? bankError?.message || bankError : "No error");
  }, [bankMappingData, isBankLoading, isBankError, bankError]);

  // ── Project → Bank map (project name se bank account dhundhne ke liye) ──
  const projectToBankMap = useMemo(() => {
    const map = bankMappingData?.map || bankMappingData?.projectToBankMap || {};
    console.log("Final projectToBankMap object:", map);
    return map;
  }, [bankMappingData]);

  // ── API ki list se saare unique valid bank accounts ──
  const allUniqueBanks = useMemo(() => {
    const list = bankMappingData?.list || [];
    const unique = [...new Set(
      list
        .map(item => item.bankAccount)
        .filter(b => b && b.trim() !== '' && b.trim() !== '—')
    )];
    console.log("[allUniqueBanks] Unique banks from API:", unique);
    return unique;
  }, [bankMappingData]);

  // ── API ki list se saare unique valid project names (bank dropdown ke liye) ──
  // Yeh fallback hai agar bankAccount empty/dash ho toh project names dikhao
  const allUniqueProjects = useMemo(() => {
    const list = bankMappingData?.list || [];
    const unique = [...new Set(
      list
        .map(item => item.project)
        .filter(p => p && p.trim() !== '' && p.trim() !== '—')
    )];
    console.log("[allUniqueProjects] Unique projects from API:", unique);
    return unique;
  }, [bankMappingData]);

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [gstPercent, setGstPercent] = useState(0);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const columns = useMemo(
    () => [
      { key: 'plannedDate', label: 'Planned Date' },
      { key: 'id', label: 'ID' },
      { key: 'applicationDate', label: 'App. Date' },
      { key: 'applicantName', label: 'Applicant' },
      { key: 'contact', label: 'Contact' },
      { key: 'project', label: 'Project' },
      { key: 'block', label: 'Block' },
      { key: 'unitNo', label: 'Unit No' },
      { key: 'unitType', label: 'Unit Type' },
      { key: 'agreementValue', label: 'Agreement Value' },
      { key: 'bookingAmount', label: 'Booking Amt' },
      { key: 'balanceToReceive', label: 'Balance' },
    ],
    []
  );

  const uniqueProjects = useMemo(() => {
    return [...new Set(bookings.map((b) => b.project).filter(Boolean))];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(s)
        );
      const matchesProject = !projectFilter || row.project === projectFilter;
      return matchesSearch && matchesProject;
    });
  }, [bookings, search, projectFilter]);

  // ── Bank dropdown ke liye available options ──
  // Priority: 1) API se unique bankAccounts  2) Fallback: project names from API list
  const availableBanks = useMemo(() => {
    // Agar valid bank accounts hain API mein
    if (allUniqueBanks.length > 0) {
      if (!selectedRow?.project) return allUniqueBanks;

      const mappedBank = projectToBankMap[selectedRow.project];
      const isValidMapped = mappedBank && mappedBank.trim() !== '' && mappedBank.trim() !== '—';

      if (isValidMapped) {
        // Mapped bank ko pehle dikhao, baaki baad mein
        const rest = allUniqueBanks.filter(b => b !== mappedBank);
        console.log(`[availableBanks] Mapped bank: ${mappedBank}, rest:`, rest);
        return [mappedBank, ...rest];
      }

      return allUniqueBanks;
    }

    // Fallback: agar bankAccount sab '—' hain toh project names dikhao
    if (allUniqueProjects.length > 0) {
      console.log("[availableBanks] Falling back to project names as bank options");
      return allUniqueProjects;
    }

    // Last resort fallback
    console.log("[availableBanks] No API data → showing default banks");
    return ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'PNB', 'Other'];
  }, [selectedRow?.project, projectToBankMap, allUniqueBanks, allUniqueProjects]);

  const openEdit = (row) => {
    setSelectedRow(row);

    // Mapped bank nikalo project ke basis par
    const mappedBank = projectToBankMap[row?.project];
    const isValidMapped = mappedBank && mappedBank.trim() !== '' && mappedBank.trim() !== '—';
    const defaultBank = isValidMapped ? mappedBank : '';

    console.log(`[openEdit] Row ID: ${row?.id} | Project: ${row?.project} | Default Bank: "${defaultBank}"`);

    setForm({
      status: row?.status || ' ',
      Bank_Name: defaultBank,
      Payment_Mode: row?.Payment_Mode || '',
      Payment_Details: row?.Payment_Details || '',
      Payment_Date: row?.Payment_Date || '',
      Amount_Received: row?.Amount_Received || '',
      CGST: row?.CGST || '',
      SGST: row?.SGST || '',
      Net_Amount: row?.Net_Amount || '',
      Remark: row?.remark ?? '',
    });

    const base = Number(row?.Amount_Received || 0);
    const totalGst = Number(row?.CGST || 0) + Number(row?.SGST || 0);
    const percent = base > 0 ? Math.round((totalGst / base) * 100) : 0;
    setGstPercent(percent);

    setOpen(true);
  };

  const closeEdit = () => {
    setOpen(false);
    setSelectedRow(null);
    setForm(emptyForm);
    setGstPercent(0);
  };

  const recalcGst = (amountReceived, pct) => {
    const base = Number(amountReceived || 0);
    const half = pct / 2;
    const cgst = parseFloat(((base * half) / 100).toFixed(2));
    const sgst = parseFloat(((base * half) / 100).toFixed(2));
    const net = parseFloat((base + cgst + sgst).toFixed(2));
    return { cgst: String(cgst), sgst: String(sgst), netAmount: String(net) };
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'Amount_Received') {
        const { cgst, sgst, netAmount } = recalcGst(value, gstPercent);
        next.CGST = cgst;
        next.SGST = sgst;
        next.Net_Amount = netAmount;
      }
      return next;
    });
  };

  const onGstChange = (e) => {
    const pct = Number(e.target.value);
    setGstPercent(pct);
    const { cgst, sgst, netAmount } = recalcGst(form.Amount_Received, pct);
    setForm((prev) => ({ ...prev, CGST: cgst, SGST: sgst, Net_Amount: netAmount }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bookingId: selectedRow?.id,
      status: form.status,
      Bank_Name: form.Bank_Name,
      Payment_Mode: form.Payment_Mode,
      Payment_Details: form.Payment_Details,
      Payment_Date: form.Payment_Date,
      Amount_Received: form.Amount_Received,
      CGST: form.CGST,
      SGST: form.SGST,
      Net_Amount: form.Net_Amount,
      Remark: form.Remark,
    };

    console.log("[onSubmit] Sending payload to backend:", payload);

    try {
      const result = await updatePayment(payload).unwrap();
      console.log("[onSubmit] Success response:", result);
      closeEdit();
    } catch (err) {
      console.error("[onSubmit] Update failed:", err);
      alert(err?.data?.message || 'Payment update में समस्या आई है। कृपया दोबारा प्रयास करें।');
    }
  };

  if (isLoading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
        <span style={{ color: '#64748b', fontSize: 14 }}>Bookings लोड हो रहे हैं...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={errorStyle}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span>{error?.data?.message || error?.error || 'कुछ गड़बड़ हो गई है'}</span>
        <button onClick={refetch} style={retryBtn}>दोबारा कोशिश करें</button>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="aba-root">

        <div className="aba-header">
          <div>
            <h2 className="aba-title">Actual Booking Amount</h2>
            <p className="aba-subtitle">{filteredBookings.length} रिकॉर्ड मिले</p>
          </div>
          <div className="aba-stats">
            <StatPill label="Total" value={bookings.length} color="#6366f1" />
            <StatPill label="Filtered" value={filteredBookings.length} color="#10b981" />
          </div>
        </div>

        <div className="aba-filters">
          <div className="aba-search-wrap">
            <svg className="aba-search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#94a3b8" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="aba-search"
              type="text"
              placeholder="कुछ भी सर्च करें..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="aba-clear-btn" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <select
            className="aba-filter-select"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">सभी प्रोजेक्ट</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {(search || projectFilter) && (
            <button
              className="aba-reset-btn"
              onClick={() => { setSearch(''); setProjectFilter(''); }}
            >
              फ़िल्टर हटाएं
            </button>
          )}
        </div>

        <div className="aba-table-wrap">
          <table className="aba-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="aba-empty">
                    <div className="aba-empty-inner">
                      <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
                        <rect x="8" y="12" width="48" height="40" rx="4" stroke="#cbd5e1" strokeWidth="2" />
                        <path d="M20 26h24M20 34h16" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span>कोई बुकिंग नहीं मिली</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((row, idx) => (
                  <tr key={row?.id ?? idx} className="aba-row">
                    {columns.map((c) => (
                      <td key={c.key}>{row?.[c.key] ?? '—'}</td>
                    ))}
                    <td>
                      <button className="aba-edit-btn" onClick={() => openEdit(row)} title="Edit">
                        <FaPencilAlt size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {open && (
          <div className="aba-backdrop" onClick={closeEdit}>
            <div className="aba-modal" onClick={(e) => e.stopPropagation()}>

              <div className="aba-modal-header">
                <div>
                  <h3 className="aba-modal-title">Payment Update</h3>
                  <p className="aba-modal-sub">#{selectedRow?.id} · {selectedRow?.applicantName}</p>
                </div>
                <button className="aba-close" onClick={closeEdit}>
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={onSubmit} className="aba-form">
                <div className="aba-form-grid">

                  <FormField label="Status">
                    <select name="status" value={form.status} onChange={onChange} className="aba-input">
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FormField>

                  {/* ── Bank Name Dropdown ── */}
                  <FormField label="Bank Name">
                    {isBankLoading ? (
                      <div style={{ padding: '9px 12px', background: '#f1f5f9', borderRadius: '9px', color: '#64748b', fontSize: 13 }}>
                        ⏳ बैंक लोड हो रहा है...
                      </div>
                    ) : isBankError ? (
                      <div style={{ padding: '9px 12px', background: '#fee2e2', borderRadius: '9px', color: '#dc2626', fontSize: 13 }}>
                        ⚠️ बैंक लिस्ट लोड नहीं हो पाई
                      </div>
                    ) : (
                      <select
                        name="Bank_Name"
                        value={form.Bank_Name}
                        onChange={onChange}
                        className="aba-input"
                      >
                        <option value="">-- बैंक चुनें --</option>
                        {availableBanks.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    )}
                  </FormField>

                  <FormField label="Payment Mode">
                    <select name="Payment_Mode" value={form.Payment_Mode} onChange={onChange} className="aba-input">
                      <option value="">Select mode</option>
                      {paymentModeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </FormField>

                  <FormField label="Payment Details">
                    <input
                      name="Payment_Details"
                      value={form.Payment_Details}
                      onChange={onChange}
                      className="aba-input"
                      placeholder="UTR / Ref No / Cheque No ..."
                    />
                  </FormField>

                  <FormField label="Payment Date">
                    <input
                      type="date"
                      name="Payment_Date"
                      value={form.Payment_Date}
                      onChange={onChange}
                      className="aba-input"
                    />
                  </FormField>

                  <FormField label="Amount Received">
                    <input
                      name="Amount_Received"
                      value={form.Amount_Received}
                      onChange={onChange}
                      className="aba-input"
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </FormField>

                  <FormField label="GST % (UI only)">
                    <select
                      value={gstPercent}
                      onChange={onGstChange}
                      className="aba-input aba-input-gst"
                    >
                      {gstSlabs.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label={`CGST (${gstPercent / 2}%)`}>
                    <input
                      name="CGST"
                      value={form.CGST}
                      readOnly
                      className="aba-input aba-input-computed"
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField label={`SGST (${gstPercent / 2}%)`}>
                    <input
                      name="SGST"
                      value={form.SGST}
                      readOnly
                      className="aba-input aba-input-computed"
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField label="Net Amount (incl. GST)">
                    <input
                      name="Net_Amount"
                      value={form.Net_Amount}
                      readOnly
                      className="aba-input aba-input-computed aba-input-net"
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField label="Remark" full>
                    <textarea
                      name="Remark"
                      value={form.Remark}
                      onChange={onChange}
                      className="aba-input aba-textarea"
                      placeholder="कोई टिप्पणी या नोट..."
                    />
                  </FormField>

                </div>

                <div className="aba-form-footer">
                  <button type="button" onClick={closeEdit} className="aba-btn-ghost">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="aba-btn-primary"
                    disabled={isUpdating || isBankLoading}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {updateError && (
                  <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                    {updateError?.data?.message || 'सेव करने में समस्या आई है। कृपया चेक करें।'}
                  </div>
                )}

                {isSuccess && (
                  <div style={{ color: '#15803d', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                    ✅ Payment सफलतापूर्वक अपडेट हो गया!
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function FormField({ label, children, full }) {
  return (
    <div className={`aba-field${full ? ' aba-field-full' : ''}`}>
      <label className="aba-label">{label}</label>
      {children}
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="aba-stat-pill" style={{ '--pill-color': color }}>
      <span className="aba-stat-value">{value}</span>
      <span className="aba-stat-label">{label}</span>
    </div>
  );
}

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  padding: 60,
};

const spinnerStyle = {
  width: 32,
  height: 32,
  border: '3px solid #e2e8f0',
  borderTopColor: '#6366f1',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 20px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 10,
  color: '#dc2626',
  margin: 16,
  fontSize: 14,
};

const retryBtn = {
  marginLeft: 'auto',
  padding: '6px 14px',
  background: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: none; } }

.aba-root {
  font-family: 'DM Sans', sans-serif;
  background: #f8fafc;
  min-height: 100vh;
  padding: 28px;
  color: #0f172a;
}

.aba-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 12px;
}

.aba-title {
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.aba-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.aba-stats { display: flex; gap: 10px; }

.aba-stat-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.aba-stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--pill-color, #6366f1);
  line-height: 1.1;
}

.aba-stat-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.aba-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
  align-items: center;
}

.aba-search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 380px;
}

.aba-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.aba-search {
  width: 100%;
  padding: 9px 36px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #0f172a;
  background: white;
  outline: none;
  transition: border-color 0.18s;
  box-sizing: border-box;
}

.aba-search:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.aba-clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.aba-filter-select {
  padding: 9px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #334155;
  background: white;
  outline: none;
  cursor: pointer;
  transition: border-color 0.18s;
}

.aba-filter-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.aba-reset-btn {
  padding: 9px 16px;
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.aba-reset-btn:hover { background: #fee2e2; }

.aba-table-wrap {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  animation: fadeIn 0.3s ease;
}

.aba-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.aba-table thead tr {
  border-bottom: 2px solid #3730a3;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #3730a3 100%);
}

.aba-table th {
  text-align: left;
  padding: 18px 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: #ffffff;
  white-space: nowrap;
  position: relative;
}

.aba-table th:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(255,255,255,0.25);
}

.aba-row {
  transition: background 0.13s;
  border-bottom: 1px solid #f1f5f9;
}

.aba-row:last-child { border-bottom: none; }
.aba-row:hover { background: #f8fafc; }

.aba-table td {
  padding: 11px 14px;
  white-space: nowrap;
  color: #334155;
}

.aba-table td:first-child {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #6366f1;
  font-weight: 500;
}

.aba-empty td { padding: 0 !important; }

.aba-empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 50px;
  color: #94a3b8;
  font-size: 14px;
}

.aba-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.15s;
}

.aba-edit-btn:hover {
  background: #eef2ff;
  border-color: #6366f1;
  box-shadow: 0 2px 6px rgba(99,102,241,0.15);
  transform: translateY(-1px);
}

.aba-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
}

.aba-modal {
  width: min(860px, 100%);
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  animation: modalIn 0.25s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.aba-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1.5px solid #f1f5f9;
  margin-bottom: 6px;
}

.aba-modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #0f172a;
}

.aba-modal-sub {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
  font-family: 'DM Mono', monospace;
}

.aba-close {
  width: 34px;
  height: 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.15s;
}

.aba-close:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.aba-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .aba-form-grid { grid-template-columns: 1fr; }
}

.aba-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.aba-field-full { grid-column: 1 / -1; }

.aba-label {
  font-size: 11.5px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.aba-input {
  padding: 9px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #0f172a;
  background: #fafafa;
  outline: none;
  transition: all 0.16s;
  width: 100%;
  box-sizing: border-box;
}

.aba-input:focus {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.aba-input-gst {
  border-color: #fcd34d !important;
  background: #fffbeb !important;
}

.aba-input-gst:focus {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important;
}

.aba-input-computed {
  background: #f1f5f9 !important;
  color: #475569 !important;
  cursor: not-allowed;
  border-style: dashed !important;
}

.aba-input-net {
  background: #f0fdf4 !important;
  color: #15803d !important;
  font-weight: 600 !important;
  border-color: #86efac !important;
}

.aba-textarea {
  min-height: 72px;
  resize: vertical;
}

.aba-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1.5px solid #f1f5f9;
}

.aba-btn-ghost {
  padding: 9px 20px;
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.aba-btn-ghost:hover {
  border-color: #94a3b8;
  color: #334155;
}

.aba-btn-primary {
  padding: 9px 22px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}

.aba-btn-primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
  transform: translateY(-1px);
}
`;

export default ActualBookingAmount;