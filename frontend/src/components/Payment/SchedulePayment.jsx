import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, User, Phone, Building2, Hash, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle } from 'lucide-react';

const SchedulePayment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [filter, setFilter] = useState('all');

  // Dummy data for demonstration
  const dummyData = [
    {
      Planned: '2024-01-15',
      paymentId: 'PAY001',
      bookingId: 'BK2024001',
      projectType: 'Residential',
      unitType: 'Apartment',
      unitNo: 'A-101',
      block: 'Tower A',
      size: '1200 sq ft',
      unitCode: 'RES-A-101',
      applicantName: 'Rahul Sharma',
      contact: '+91 9876543210',
      agreementValue: '5000000',
      bookingAmount: '500000',
      scheduleAmount: '1000000',
      Actual: '2024-01-15',
      paymentHistory: [
        { date: '2024-01-15', amount: '500000', type: 'Booking', status: 'completed' },
        { date: '2024-02-15', amount: '500000', type: 'Installment 1', status: 'completed' },
        { date: '2024-03-15', amount: '500000', type: 'Installment 2', status: 'pending' }
      ]
    },
    {
      Planned: '2024-02-10',
      paymentId: 'PAY002',
      bookingId: 'BK2024002',
      projectType: 'Commercial',
      unitType: 'Shop',
      unitNo: 'S-205',
      block: 'Block B',
      size: '800 sq ft',
      unitCode: 'COM-B-205',
      applicantName: 'Priya Patel',
      contact: '+91 9123456780',
      agreementValue: '7500000',
      bookingAmount: '750000',
      scheduleAmount: '1500000',
      Actual: '',
      paymentHistory: [
        { date: '2024-01-10', amount: '750000', type: 'Booking', status: 'completed' },
        { date: '2024-02-10', amount: '750000', type: 'Installment 1', status: 'pending' }
      ]
    },
    {
      Planned: '2024-01-20',
      paymentId: 'PAY003',
      bookingId: 'BK2024003',
      projectType: 'Residential',
      unitType: 'Villa',
      unitNo: 'V-12',
      block: 'Premium Block',
      size: '2500 sq ft',
      unitCode: 'RES-V-12',
      applicantName: 'Amit Kumar',
      contact: '+91 9988776655',
      agreementValue: '12000000',
      bookingAmount: '1200000',
      scheduleAmount: '2400000',
      Actual: '2024-01-22',
      paymentHistory: [
        { date: '2024-01-20', amount: '1200000', type: 'Booking', status: 'completed' },
        { date: '2024-02-20', amount: '1200000', type: 'Installment 1', status: 'completed' },
        { date: '2024-03-20', amount: '1200000', type: 'Installment 2', status: 'completed' },
        { date: '2024-04-20', amount: '1200000', type: 'Installment 3', status: 'pending' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayments(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleRow = (paymentId) => {
    setExpandedRows(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getPaymentStatus = (planned, actual) => {
    if (actual) return 'completed';
    const plannedDate = new Date(planned);
    const today = new Date();
    if (plannedDate < today) return 'overdue';
    return 'pending';
  };

  const getTotalPaid = (history) => {
    return history
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const getTotalPending = (history) => {
    return history
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const filteredPayments = payments.filter(payment => {
    const status = getPaymentStatus(payment.Planned, payment.Actual);
    if (filter === 'all') return true;
    return status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <DollarSign className="text-indigo-600" size={36} />
                Payment Schedule Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track and manage unit payment schedules</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({payments.length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'overdue' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>
        </div>

        {/* Payment Cards */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => {
            const status = getPaymentStatus(payment.Planned, payment.Actual);
            const isExpanded = expandedRows[payment.paymentId];
            const totalPaid = getTotalPaid(payment.paymentHistory);
            const totalPending = getTotalPending(payment.paymentHistory);
            const agreementValue = parseFloat(payment.agreementValue || 0);
            const progressPercentage = (totalPaid / agreementValue) * 100;

            return (
              <div key={payment.paymentId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Main Card */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-800">{payment.applicantName}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status === 'completed' ? '✓ Completed' :
                           status === 'pending' ? '⏳ Pending' :
                           '⚠ Overdue'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Hash size={16} className="text-indigo-600" />
                          <span className="font-medium">Booking:</span> {payment.bookingId}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 size={16} className="text-indigo-600" />
                          <span className="font-medium">Unit:</span> {payment.unitNo}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-indigo-600" />
                          <span>{payment.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-indigo-600" />
                          <span className="font-medium">Planned:</span> {formatDate(payment.Planned)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Payment Progress</span>
                      <span className="font-bold text-indigo-600">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Agreement Value</p>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(payment.agreementValue)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Total Paid</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Pending Amount</p>
                      <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Balance Due</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(agreementValue - totalPaid)}</p>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleRow(payment.paymentId)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    {isExpanded ? 'Hide' : 'View'} Payment History
                  </button>
                </div>

                {/* Payment History (Expandable) */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-indigo-600" />
                      Payment History
                    </h3>
                    <div className="space-y-3">
                      {payment.paymentHistory.map((history, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {history.status === 'completed' ? (
                              <CheckCircle2 className="text-green-500" size={24} />
                            ) : (
                              <XCircle className="text-yellow-500" size={24} />
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">{history.type}</p>
                              <p className="text-sm text-gray-600">{formatDate(history.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-800">{formatCurrency(history.amount)}</p>
                            <p className={`text-xs font-semibold ${
                              history.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {history.status === 'completed' ? 'Paid ✓' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPayments.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <DollarSign size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No payments found</h3>
            <p className="text-gray-600">No payment schedules match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePayment;