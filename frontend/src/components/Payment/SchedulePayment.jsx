// import React, { useState, useMemo } from 'react';
// import {
//   Calendar, DollarSign, Hash, Building2, Phone, CreditCard,
//   ChevronDown, ChevronUp, Search, Home, TrendingUp, AlertCircle,
//   Edit3, X, FileText, Loader2
// } from 'lucide-react';

// import { 
//   useGetSchedulePaymentsQuery,
//   useUpdateSchedulePaymentMutation 
// } from '../../features/SchedulePayment/SchedulePaymentSlice';

// const SchedulePayment = () => {
//   const [expandedBookings, setExpandedBookings] = useState({});
//   const [expandedSchedules, setExpandedSchedules] = useState({});
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showActionModal, setShowActionModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [actionForm, setActionForm] = useState({
//     status: '',
//     remark: '',
//     amountReceived: '',
//     nextDate: '',
//     lastDateOfReceiving: ''
//   });

//   const {
//     data: payments = [],
//     isLoading,
//     isFetching,
//     isError,
//     error
//   } = useGetSchedulePaymentsQuery();

//   const [updateSchedulePayment, { isLoading: isUpdating }] = useUpdateSchedulePaymentMutation();

//   const groupedBookings = useMemo(() => {
//     const groups = {};
//     payments.forEach(payment => {
//       const bookingId = payment.bookingId;
//       if (!groups[bookingId]) {
//         groups[bookingId] = {
//           bookingId,
//           applicantName: payment.applicantName,
//           unitNo: payment.unitNo,
//           unitCode: payment.unitCode,
//           block: payment.block,
//           unitType: payment.unitType,
//           size: payment.size,
//           projectType: payment.projectType,
//           contact: payment.contact,
//           email: payment.email,
//           CurrentAddress: payment.CurrentAddress,
//           agreementValue: Number(payment.agreementValue || 0),
//           bookingAmount: Number(payment.bookingAmount || 0),
//           balanceToReceive: Number(payment.BalanceToRecive || payment.balanceToReceive || 0),
//           schedules: []
//         };
//       }
//       groups[bookingId].schedules.push(payment);
//     });

//     Object.values(groups).forEach(group => {
//       if (group.balanceToReceive <= 0) {
//         group.balanceToReceive = group.agreementValue - group.bookingAmount;
//       }
//     });

//     return Object.values(groups);
//   }, [payments]);

//   const toggleBooking = (bookingId) => {
//     setExpandedBookings(prev => ({ ...prev, [bookingId]: !prev[bookingId] }));
//   };

//   const toggleSchedule = (key) => {
//     setExpandedSchedules(prev => ({ ...prev, [key]: !prev[key] }));
//   };

//   const formatCurrency = (amount) => {
//     if (!amount || isNaN(amount)) return '₹0';
//     return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return 'N/A';
//     if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

//     const date = new Date(dateStr);
//     if (!isNaN(date.getTime())) {
//       const day = String(date.getDate()).padStart(2, '0');
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const year = date.getFullYear();
//       return `${day}/${month}/${year}`;
//     }
//     return dateStr;
//   };

//   const getPaymentStatus = (schedule) => {
//     const balance = Number(schedule.BalanceToRecive || schedule.balanceToReceive || schedule.balance || 0);
//     const followupRaw = (schedule.FollowUp || '').trim().toUpperCase();
//     const hasPositiveBalance = balance > 0;
//     const needsFollowUp = followupRaw === 'Y' || followupRaw === 'YES';

//     return (hasPositiveBalance || needsFollowUp) ? 'pending' : 'completed';
//   };

//   const getStatusDisplay = (status, needsFollowUp) => {
//     if (status === 'completed') {
//       return { text: '✓ Completed', className: 'bg-green-100 text-green-800' };
//     }
//     if (needsFollowUp) {
//       return { text: '⚠ Follow-up Required', className: 'bg-orange-100 text-orange-800' };
//     }
//     return { text: '⏳ Pending', className: 'bg-yellow-100 text-yellow-800' };
//   };

//   const openActionModal = (payment) => {
//     setSelectedPayment(payment);
//     setActionForm({
//       status: '',
//       remark: '',
//       amountReceived: '',
//       nextDate: '',
//       lastDateOfReceiving: ''
//     });
//     setShowActionModal(true);
//   };

//   const closeActionModal = () => {
//     setShowActionModal(false);
//     setSelectedPayment(null);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setActionForm(prev => ({ ...prev, [name]: value }));
//   };

//   const formatToDDMMYYYY = (dateValue) => {
//     if (!dateValue) return '';
//     if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) return dateValue;

//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return '';

//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const handleSubmitAction = async () => {
//     if (!actionForm.status) {
//       alert("Status select karna zaroori hai");
//       return;
//     }

//     if ((actionForm.status === 'Done' || actionForm.status === 'partial') && 
//         (!actionForm.amountReceived || Number(actionForm.amountReceived) <= 0)) {
//       alert("Amount Received daalna zaroori hai aur 0 se zyada hona chahiye");
//       return;
//     }

//     if ((actionForm.status === 'pending' || actionForm.status === 'partial') && 
//         (!actionForm.nextDate || !actionForm.remark?.trim())) {
//       alert("Pending/Partial के लिए Next Date aur Remark dono bharein");
//       return;
//     }

//     try {
//       const payload = {
//         paymentId: selectedPayment?.paymentId?.trim() || '',
//         status: actionForm.status,
//         lastDateOfReceiving: formatToDDMMYYYY(actionForm.lastDateOfReceiving),
//         nextDate: formatToDDMMYYYY(actionForm.nextDate),
//         amountReceived: actionForm.amountReceived || '',
//         remark: actionForm.remark?.trim() || '',

//         Planned: formatToDDMMYYYY(selectedPayment?.Planned),
//         bookingId: selectedPayment?.bookingId || '',
//         applicantName: selectedPayment?.applicantName || '',
//         contact: selectedPayment?.contact || '',
//         email: selectedPayment?.email || '',
//         CurrentAddress: selectedPayment?.CurrentAddress || '',
//         agreementValue: selectedPayment?.agreementValue || '',
//         bookingAmount: selectedPayment?.bookingAmount || '',
//         unitCode: selectedPayment?.unitCode || '',
//         block: selectedPayment?.block || '',
//         unitNo: selectedPayment?.unitNo || '',
//         unitType: selectedPayment?.unitType || '',
//         size: selectedPayment?.size || '',
//         projectType: selectedPayment?.projectType || '',
//         Date: formatToDDMMYYYY(selectedPayment?.Date)
//       };

//       await updateSchedulePayment(payload).unwrap();
//       alert("सफलतापूर्वक अपडेट / नई एंट्री जोड़ दी गई!");
//       closeActionModal();
//     } catch (err) {
//       console.error("Update error:", err);
//       alert("Update failed: " + (err?.data?.message || err?.message || "Unknown error"));
//     }
//   };

//   const filteredBookings = groupedBookings.filter(booking => {
//     if (!searchQuery) return true;
//     const searchLower = searchQuery.toLowerCase();
//     return [
//       booking.applicantName,
//       booking.bookingId,
//       booking.unitNo,
//       booking.unitCode,
//       booking.block,
//       booking.contact,
//       booking.email
//     ].some(field => (field || '').toString().toLowerCase().includes(searchLower));
//   });

//   if (isLoading || isFetching) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="animate-spin h-16 w-16 text-indigo-600 mx-auto" />
//           <p className="mt-4 text-gray-600 font-medium">Loading payment schedules...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
//         <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg">
//           <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to load data</h2>
//           <p className="text-gray-600 mb-4">
//             {error?.data?.error || error?.message || 'Something went wrong'}
//           </p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     // ✅ FULL WIDTH के लिए यहाँ main wrapper से 'max-w-7xl mx-auto' हटा दिया
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       {/* ✅ Header Section - Full Width */}
//       <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//         <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
//           <DollarSign className="text-indigo-600" size={36} />
//           Payment Schedule Dashboard
//         </h1>
//         <p className="text-gray-600">Track and manage unit payment schedules by booking</p>
//       </div>

//       {/* ✅ Stats Cards - Full Width Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-5 text-white">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">Total Bookings</h3>
//           <p className="text-3xl font-black">{groupedBookings.length}</p>
//         </div>
//         <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-sm p-5 text-white">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-green-100 mb-1">Total Schedules</h3>
//           <p className="text-3xl font-black">{payments.length}</p>
//         </div>
//         <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-sm p-5 text-white">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-purple-100 mb-1">Avg Schedules/Booking</h3>
//           <p className="text-3xl font-black">
//             {groupedBookings.length > 0 ? (payments.length / groupedBookings.length).toFixed(1) : 0}
//           </p>
//         </div>
//       </div>

//       {/* ✅ Search Bar - Full Width */}
//       <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//         <div className="relative w-full">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//           <input

//             type="text"
//             placeholder="Search by name, booking ID, unit, contact, email..."
//             value={searchQuery}
//             onChange={e => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
//           />
//         </div>
//         {searchQuery && (
//           <div className="mt-4 text-sm text-gray-600">
//             Showing <span className="font-bold text-indigo-600">{filteredBookings.length}</span> booking(s)
//           </div>
//         )}
//       </div>

//       {/* ✅ Bookings List - Full Width Cards */}
//       <div className="space-y-4">
//         {filteredBookings.map(booking => {
//           const isBookingExpanded = expandedBookings[booking.bookingId];
//           const totalSchedules = booking.schedules.length;
//           const pendingSchedules = booking.schedules.filter(s => getPaymentStatus(s) === 'pending').length;

//           return (
//             <div key={booking.bookingId} className="bg-white rounded-xl shadow-lg overflow-hidden">
//               {/* Booking Header */}
//               <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-100">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex-1">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-2">{booking.applicantName || '—'}</h2>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <Hash size={16} className="text-indigo-600" />
//                         <span className="font-semibold">Booking:</span> {booking.bookingId}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <Building2 size={16} className="text-indigo-600" />
//                         <span className="font-semibold">Unit:</span> {booking.unitNo || '—'}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <Phone size={16} className="text-indigo-600" />
//                         {booking.contact || '—'}
//                       </div>
//                       <div className="flex items-center gap-2 text-gray-700">
//                         <CreditCard size={16} className="text-indigo-600" />
//                         <span className="font-semibold">Pending / Total:</span> {pendingSchedules}/{totalSchedules}

//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ✅ Unit Details - Full Width Grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-white p-4 rounded-lg text-sm mb-4">
//                   <div><p className="text-xs text-gray-500">Unit Code</p><p className="font-semibold">{booking.unitCode || '—'}</p></div>
//                   <div><p className="text-xs text-gray-500">Block</p><p className="font-semibold">{booking.block || '—'}</p></div>
//                   <div><p className="text-xs text-gray-500">Unit Type</p><p className="font-semibold">{booking.unitType || '—'}</p></div>
//                   <div><p className="text-xs text-gray-500">Size</p><p className="font-semibold">{booking.size || '—'}</p></div>
//                   <div><p className="text-xs text-gray-500">Project</p><p className="font-semibold">{booking.projectType || '—'}</p></div>
//                   <div><p className="text-xs text-gray-500">Agreement Value</p><p className="font-semibold text-indigo-700">{formatCurrency(booking.agreementValue)}</p></div>
//                   <div className="col-span-2"><p className="text-xs text-gray-500">Current Address</p><p className="font-semibold">{booking.CurrentAddress || '—'}</p></div>
//                   <div  className="col-span-2"><p className="text-xs text-gray-500">Email</p><p className="font-semibold">{booking.email || '—'}</p></div>
//                   <div ><p className="text-xs text-gray-500">Next FollowUp Date </p><p className="font-semibold">{'—'}</p></div>
//                 </div>

//                 <button
//                   onClick={() => toggleBooking(booking.bookingId)}
//                   className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
//                 >
//                   {isBookingExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                   {isBookingExpanded ? 'Hide Schedules' : `View All Schedules (${totalSchedules})`}
//                 </button>
//               </div>

//               {isBookingExpanded && (
//                 <div className="p-6 space-y-4 bg-gray-50">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <Calendar className="text-indigo-600" size={20} />
//                     Payment Schedules ({totalSchedules})
//                   </h3>

//                   {booking.schedules.map((schedule, idx) => {
//                     const balance = Number(schedule.BalanceToRecive || 0);
//                     const status = getPaymentStatus(schedule);
//                     const display = getStatusDisplay(status, (schedule.FollowUp || '').trim().toUpperCase() === 'Y');

//                     const key = schedule.paymentId || `${booking.bookingId}-${idx}`;
                    
//                     // Check if we have previous payments
//                     const hasPreviousPayments = schedule.previousPayments && schedule.previousPayments.length > 0;
                    
//                     // Calculate total received amount
//                     const totalReceived = hasPreviousPayments 
//                       ? schedule.previousPayments.reduce((sum, payment) => {
//                           return sum + (parseFloat(payment.PreviousAmountV) || 0);
//                         }, 0)
//                       : 0;

//                     return (
//                       <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
//                         {/* Header */}
//                         <div className="p-4 bg-gray-50">
//                           <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
//                             <div className="flex items-center gap-3 flex-wrap">
//                               <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
//                                 {schedule.projectType} 
//                               </span>
//                               <span className={`px-3 py-1 rounded-full text-xs font-semibold ${display.className}`}>
//                                 {display.text}
//                               </span>
//                               {(schedule.FollowUp || '').trim().toUpperCase() === 'Y' && (
//                                 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
//                                   Follow-up Y
//                                 </span>
//                               )}
//                             </div>
//                             {hasPreviousPayments && (
//                               <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
//                                 Total Received: {formatCurrency(totalReceived)}
//                               </div>
//                             )}
//                           </div>

//                           {/* ✅ Schedule Details - Full Width Grid */}
//                           <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
//                             <div><p className="text-xs text-gray-500">Planned Date</p><p className="font-semibold">{formatDate(schedule.Planned)}</p></div>
//                             <div><p className="text-xs text-gray-500">Amount</p><p className="font-bold text-indigo-700">{formatCurrency(schedule.Amount || 0)}</p></div>
//                             <div><p className="text-xs text-gray-500">Balance</p><p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</p></div>
//                             <div><p className="text-xs text-gray-500">Follow-up</p><p className="font-semibold">{schedule.FollowUp || '—'}</p></div>
//                             <div><p className="text-xs text-gray-500">Payment ID</p><p className="font-semibold">{schedule.paymentId || '—'}</p></div>
//                           </div>
//                         </div>

//                         {/* Buttons */}
//                         <div className="p-4 flex flex-col sm:flex-row gap-3 border-t">
//                           <button
//                             onClick={() => toggleSchedule(key)}
//                             className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition"
//                           >
//                             {expandedSchedules[key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                             {expandedSchedules[key] ? 'Hide Previous Info' : 'View Previous Info'}
//                           </button>

//                           <button
//                             onClick={() => openActionModal(schedule)}
//                             className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition"
//                             disabled={isUpdating}
//                           >
//                             {isUpdating ? (
//                               <>
//                                 <Loader2 size={16} className="animate-spin" />
//                                 Updating...
//                               </>
//                             ) : (
//                               <>
//                                 <Edit3 size={16} />
//                                 Take Action
//                               </>
//                             )}
//                           </button>
//                         </div>

//                         {/* Previous Info - Enhanced Table Style */}
//                         {expandedSchedules[key] && (
//                           <div className="p-5 border-t bg-gradient-to-br from-gray-50 to-blue-50">
//                             <div className="mb-4">
//                               <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                                 <FileText size={20} className="text-indigo-600" />
//                                 Previous Payment History
//                               </h4>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 Complete record of past transactions ({hasPreviousPayments ? schedule.previousPayments.length : 0} records)
//                               </p>
//                             </div>

//                             {hasPreviousPayments ? (
//                               <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-indigo-100">
//                                 {/* Table Header - Sticky on scroll */}
//                                 <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 grid grid-cols-12 gap-3 text-xs font-bold text-white uppercase tracking-wider sticky top-0">
//                                   <div className="col-span-1 flex items-center gap-1">
//                                     #
//                                   </div>
//                                   <div className="col-span-3 flex items-center gap-1">
//                                     <Calendar size={14} />
//                                     Received Date
//                                   </div>
//                                   <div className="col-span-2 flex items-center gap-1">
//                                     <DollarSign size={14} />
//                                     Amount
//                                   </div>
//                                   <div className="col-span-3 flex items-center gap-1">
//                                     <TrendingUp size={14} />
//                                     Next Date
//                                   </div>
//                                   <div className="col-span-3 flex items-center gap-1">
//                                     <FileText size={14} />
//                                     Remark
//                                   </div>
//                                 </div>

//                                 {/* Table Body - Full Width */}
//                                 <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
//                                   {schedule.previousPayments.map((payment, index) => (
//                                     <div 
//                                       key={index} 
//                                       className="px-4 py-4 grid grid-cols-12 gap-3 text-sm hover:bg-indigo-50 transition-colors"
//                                     >
//                                       <div className="col-span-1">
//                                         <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-800 font-bold rounded-full">
//                                           {index + 1}
//                                         </span>
//                                       </div>
//                                       <div className="col-span-3">
//                                         <div className="flex items-center gap-2">
//                                           <span className={`w-2 h-2 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'} rounded-full`}></span>
//                                           <span className="font-semibold text-gray-800">
//                                             {payment.previousReceviedAmountDate 
//                                               ? formatDate(payment.previousReceviedAmountDate) 
//                                               : '—'}
//                                           </span>
//                                         </div>
//                                       </div>
//                                       <div className="col-span-2">
//                                         <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold rounded-lg">
//                                           {payment.PreviousAmountV 
//                                             ? formatCurrency(payment.PreviousAmountV) 
//                                             : '—'}
//                                         </span>
//                                       </div>
//                                       <div className="col-span-3">
//                                         <span className="font-medium text-gray-700">
//                                           {payment.NextDate 
//                                             ? formatDate(payment.NextDate) 
//                                             : '—'}
//                                         </span>
//                                       </div>
//                                       <div className="col-span-3">
//                                         <div className="text-gray-700 leading-relaxed">
//                                           <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
//                                             {payment.previousRemark || '—'}
//                                           </p>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   ))}
//                                 </div>

//                                 {/* Footer info */}
//                                 <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 border-t border-gray-200 flex items-center justify-between">
//                                   <span className="flex items-center gap-2">
//                                     <AlertCircle size={14} />
//                                     Total Records: {schedule.previousPayments.length}
//                                   </span>
//                                   <span className="text-indigo-600 font-bold">
//                                     Total Amount: {formatCurrency(totalReceived)}
//                                   </span>
//                                 </div>
//                               </div>
//                             ) : (
//                               <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
//                                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
//                                   <FileText size={32} className="text-gray-400" />
//                                 </div>
//                                 <h5 className="text-base font-semibold text-gray-800 mb-1">No Previous Payments</h5>
//                                 <p className="text-sm text-gray-500">Payment history will appear here once recorded</p>
//                               </div>
//                             )}

//                             <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
//                               <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
//                               <p className="text-xs text-blue-800">
//                                 <span className="font-semibold">Note:</span> Yeh table FMS और Payment sheet के matching records दिखाता है। Jitni bhi previous payments hongi, sab yahan dikhayi jayengi.
//                               </p>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {filteredBookings.length === 0 && (
//         <div className="bg-white rounded-xl shadow-lg p-12 text-center">
//           <Search size={64} className="text-gray-300 mx-auto mb-4" />
//           <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
//           <p className="text-gray-600">
//             {searchQuery ? `No match for "${searchQuery}"` : 'No bookings available.'}
//           </p>
//         </div>
//       )}

//       {/* ✅ Action Modal - Centered but wide */}
//       {showActionModal && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
//             <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-2xl">
//               <div className="flex items-center justify-between text-white">
//                 <div>
//                   <h2 className="text-2xl font-bold flex items-center gap-2">
//                     <Edit3 size={28} />
//                     Take Action
//                   </h2>
//                   <p className="text-indigo-100 mt-1 text-sm">
//                     {selectedPayment?.applicantName} - {selectedPayment?.unitNo} ({selectedPayment?.bookingId})
//                   </p>
//                 </div>
//                 <button onClick={closeActionModal} className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition" disabled={isUpdating}>
//                   <X size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-indigo-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
//                 <div><p className="text-gray-600 text-xs">Booking ID</p><p className="font-semibold">{selectedPayment?.bookingId || '—'}</p></div>
//                 <div><p className="text-gray-600 text-xs">Unit</p><p className="font-semibold">{selectedPayment?.unitNo || '—'}</p></div>
//                 <div><p className="text-gray-600 text-xs">Planned Date</p><p className="font-semibold">{formatDate(selectedPayment?.Planned)}</p></div>
//                 <div><p className="text-gray-600 text-xs">Schedule Amount</p><p className="font-semibold">{formatCurrency(selectedPayment?.Amount || 0)}</p></div>
//               </div>

//               {/* ✅ Modal Form - Full Width */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Status <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="status"
//                     value={actionForm.status}
//                     onChange={handleFormChange}
//                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition bg-white"
//                     required
//                     disabled={isUpdating}
//                   >
//                     <option value="">Select Status</option>
//                     <option value="Done">Done</option>
//                     <option value="partial">Partial Payment</option>
//                     <option value="pending">Pending</option>
//                   </select>
//                 </div>

//                 {(actionForm.status === 'Done' || actionForm.status === 'partial') && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">Last Date of Receiving</label>
//                       <input
//                         type="date"
//                         name="lastDateOfReceiving"
//                         value={actionForm.lastDateOfReceiving || ''}
//                         onChange={handleFormChange}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
//                         disabled={isUpdating}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Amount Received <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
//                         <input
//                           type="number"
//                           name="amountReceived"
//                           value={actionForm.amountReceived || ''}
//                           onChange={handleFormChange}
//                           placeholder="Enter amount received"
//                           className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
//                           required
//                           min="0"
//                           disabled={isUpdating}
//                         />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {(actionForm.status === 'pending' || actionForm.status === 'partial') && (
//                   <>
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Next Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="nextDate"
//                         value={actionForm.nextDate || ''}
//                         onChange={handleFormChange}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
//                         required
//                         disabled={isUpdating}
//                       />
//                     </div>

//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Remark <span className="text-red-500">*</span>
//                       </label>
//                       <textarea
//                         name="remark"
//                         value={actionForm.remark || ''}
//                         onChange={handleFormChange}
//                         placeholder={actionForm.status === 'partial' ? "Partial payment details..." : "Follow-up notes..."}
//                         rows="4"
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition resize-none"
//                         required
//                         disabled={isUpdating}
//                       />
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             <div className="bg-gray-50 px-6 py-5 rounded-b-2xl flex gap-4 justify-end border-t border-gray-200">
//               <button
//                 onClick={closeActionModal}
//                 className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
//                 disabled={isUpdating}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitAction}
//                 disabled={isUpdating || !actionForm.status}
//                 className={`px-8 py-3 text-white font-semibold rounded-lg transition shadow-md flex items-center gap-2 ${
//                   isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
//                 }`}
//               >
//                 {isUpdating ? (
//                   <>
//                     <Loader2 size={18} className="animate-spin" />
//                     Submitting...
//                   </>
//                 ) : 'Submit Action'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SchedulePayment;


/////////////////////////// 

import React, { useState, useMemo } from 'react';
import {
  Calendar, DollarSign, Hash, Building2, Phone, CreditCard,
  ChevronDown, ChevronUp, Search, AlertCircle,
  Edit3, X, FileText, Loader2
} from 'lucide-react';

import { 
  useGetSchedulePaymentsQuery,
  useUpdateSchedulePaymentMutation 
} from '../../features/SchedulePayment/SchedulePaymentSlice';

const SchedulePayment = () => {
  const [expandedBookings, setExpandedBookings] = useState({});
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: '',
    remark: '',
    amountReceived: '',
    nextDate: '',
    lastDateOfReceiving: ''
  });

  const {
    data: payments = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useGetSchedulePaymentsQuery();

  const [updateSchedulePayment, { isLoading: isUpdating }] = useUpdateSchedulePaymentMutation();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // DD-MM-YYYY या अन्य format को भी DD/MM/YYYY में बदलने की कोशिश
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let d = parts[0], m = parts[1], y = parts[2];
      if (y.length === 4 && d.length <= 2 && m.length <= 2) {
        return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
      }
      if (d.length === 4) {
        return `${parts[2].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${d}`;
      }
    }

    return dateStr || '—';
  };

  const formatToDDMMYYYY = formatDate;

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // अब सबसे आखिरी previous payment entry की NextDate दिखाएगा
  // (टेबल में जो सबसे नीचे है, वही)
  const getLatestNextFollowUpDate = (schedules) => {
    let latestNextDate = null;

    schedules.forEach(schedule => {
      if (schedule.previousPayments?.length > 0) {
        // array का आखिरी item लें (last index)
        const lastEntry = schedule.previousPayments[schedule.previousPayments.length - 1];
        if (lastEntry?.NextDate) {
          latestNextDate = lastEntry.NextDate;
        }
      }
    });

    return latestNextDate ? formatDate(latestNextDate) : '—';
  };

  const groupedBookings = useMemo(() => {
    const groups = {};
    payments.forEach(payment => {
      const bookingId = payment.bookingId;
      if (!groups[bookingId]) {
        groups[bookingId] = {
          bookingId,
          applicantName: payment.applicantName,
          unitNo: payment.unitNo,
          unitCode: payment.unitCode,
          block: payment.block,
          unitType: payment.unitType,
          size: payment.size,
          projectType: payment.projectType,
          contact: payment.contact,
          email: payment.email,
          CurrentAddress: payment.CurrentAddress,
          agreementValue: Number(payment.agreementValue || 0),
          bookingAmount: Number(payment.bookingAmount || 0),
          balanceToReceive: Number(payment.BalanceToRecive || payment.balanceToReceive || 0),
          schedules: []
        };
      }
      groups[bookingId].schedules.push(payment);
    });

    Object.values(groups).forEach(group => {
      if (group.balanceToReceive <= 0) {
        group.balanceToReceive = group.agreementValue - group.bookingAmount;
      }
    });

    return Object.values(groups);
  }, [payments]);

  const filteredBookings = useMemo(() => {
    let result = groupedBookings;

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(booking =>
        [
          booking.applicantName,
          booking.bookingId,
          booking.unitNo,
          booking.unitCode,
          booking.block,
          booking.contact,
          booking.email
        ].some(field => String(field || '').toLowerCase().includes(searchLower))
      );
    }

    if (filterDate) {
      const selected = new Date(filterDate);
      if (!isNaN(selected.getTime())) {
        const target = formatToDDMMYYYY(selected);

        result = result.filter(booking =>
          booking.schedules.some(sch => {
            const planned = formatToDDMMYYYY(sch.Planned);
            const nextFollow = getLatestNextFollowUpDate([sch]);
            return planned === target || nextFollow === target;
          })
        );
      }
    }

    return result;
  }, [groupedBookings, searchQuery, filterDate]);

  const toggleBooking = (bookingId) => {
    setExpandedBookings(prev => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  const toggleSchedule = (key) => {
    setExpandedSchedules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPaymentStatus = (schedule) => {
    const balance = Number(schedule.BalanceToRecive || schedule.balanceToReceive || schedule.balance || 0);
    const followupRaw = (schedule.FollowUp || '').trim().toUpperCase();
    const hasPositiveBalance = balance > 0;
    const needsFollowUp = followupRaw === 'Y' || followupRaw === 'YES';
    return (hasPositiveBalance || needsFollowUp) ? 'pending' : 'completed';
  };

  const getStatusDisplay = (status, needsFollowUp) => {
    if (status === 'completed') {
      return { text: '✓ Completed', className: 'bg-green-100 text-green-800' };
    }
    if (needsFollowUp) {
      return { text: '⚠ Follow-up Required', className: 'bg-orange-100 text-orange-800' };
    }
    return { text: '⏳ Pending', className: 'bg-yellow-100 text-yellow-800' };
  };

  const openActionModal = (payment) => {
    setSelectedPayment(payment);
    setActionForm({
      status: '',
      remark: '',
      amountReceived: '',
      nextDate: '',
      lastDateOfReceiving: ''
    });
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedPayment(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setActionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAction = async () => {
    if (!actionForm.status) {
      alert("Status select karna zaroori hai");
      return;
    }

    if ((actionForm.status === 'Done' || actionForm.status === 'partial') && 
        (!actionForm.amountReceived || Number(actionForm.amountReceived) <= 0)) {
      alert("Amount Received daalna zaroori hai aur 0 se zyada hona chahiye");
      return;
    }

    if ((actionForm.status === 'pending' || actionForm.status === 'partial') && 
        (!actionForm.nextDate || !actionForm.remark?.trim())) {
      alert("Pending/Partial के लिए Next Date aur Remark dono bharein");
      return;
    }

    try {
      const payload = {
        paymentId: selectedPayment?.paymentId?.trim() || '',
        status: actionForm.status,
        lastDateOfReceiving: formatToDDMMYYYY(actionForm.lastDateOfReceiving),
        nextDate: formatToDDMMYYYY(actionForm.nextDate),
        amountReceived: actionForm.amountReceived || '',
        remark: actionForm.remark?.trim() || '',

        Planned: formatToDDMMYYYY(selectedPayment?.Planned),
        bookingId: selectedPayment?.bookingId || '',
        applicantName: selectedPayment?.applicantName || '',
        contact: selectedPayment?.contact || '',
        email: selectedPayment?.email || '',
        CurrentAddress: selectedPayment?.CurrentAddress || '',
        agreementValue: selectedPayment?.agreementValue || '',
        bookingAmount: selectedPayment?.bookingAmount || '',
        unitCode: selectedPayment?.unitCode || '',
        block: selectedPayment?.block || '',
        unitNo: selectedPayment?.unitNo || '',
        unitType: selectedPayment?.unitType || '',
        size: selectedPayment?.size || '',
        projectType: selectedPayment?.projectType || '',
        Date: formatToDDMMYYYY(selectedPayment?.Date)
      };

      await updateSchedulePayment(payload).unwrap();
      alert("सफलतापूर्वक अपडेट / नई एंट्री जोड़ दी गई!");
      closeActionModal();
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + (err?.data?.message || err?.message || "Unknown error"));
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading payment schedules...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg w-full">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to load data</h2>
          <p className="text-gray-600 mb-4">
            {error?.data?.error || error?.message || 'Something went wrong'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <DollarSign className="text-indigo-600" size={40} />
          Payment Schedule Dashboard
        </h1>
        <p className="text-gray-600">Track and manage unit payment schedules by booking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-5 text-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-1">Total Bookings</h3>
          <p className="text-3xl font-black">{groupedBookings.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-sm p-5 text-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-green-100 mb-1">Total Schedules</h3>
          <p className="text-3xl font-black">{payments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-sm p-5 text-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-100 mb-1">Avg Schedules/Booking</h3>
          <p className="text-3xl font-black">
            {groupedBookings.length > 0 ? (payments.length / groupedBookings.length).toFixed(1) : 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Planned / Next Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium self-start"
            >
              × Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, booking ID, unit no, contact, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {(searchQuery || filterDate) && (
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-bold text-indigo-600">{filteredBookings.length}</span> booking(s)
          </div>
        )}
      </div>

      <div className="space-y-5">
        {filteredBookings.map(booking => {
          const isExpanded = expandedBookings[booking.bookingId];
          const total = booking.schedules.length;
          const pendingCount = booking.schedules.filter(s => getPaymentStatus(s) === 'pending').length;

          return (
            <div 
              key={booking.bookingId} 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {booking.applicantName || '—'}
                    </h2>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-indigo-600" />
                        <span className="font-semibold">Booking:</span> {booking.bookingId}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-600" />
                        <span className="font-semibold">Unit:</span> {booking.unitNo || '—'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-indigo-600" />
                        <span>{booking.contact || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-indigo-600" />
                        <span className="font-semibold">Pending / Total:</span> {pendingCount}/{total}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 bg-white p-5 rounded-lg text-sm shadow-inner">
                  <div><p className="text-xs text-gray-500">Unit Code</p><p className="font-semibold">{booking.unitCode || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Block</p><p className="font-semibold">{booking.block || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Unit Type</p><p className="font-semibold">{booking.unitType || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Size</p><p className="font-semibold">{booking.size || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Project</p><p className="font-semibold">{booking.projectType || '—'}</p></div>
                  <div><p className="text-xs text-gray-500">Agreement Value</p><p className="font-semibold text-indigo-700">{formatCurrency(booking.agreementValue)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Current Address</p><p className="font-semibold">{booking.CurrentAddress || '—'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Email</p><p className="font-semibold">{booking.email || '—'}</p></div>
                  <div>
                    <p className="text-xs text-gray-500">Next FollowUp Date</p>
                    <p className="font-semibold text-indigo-700">
                      {getLatestNextFollowUpDate(booking.schedules)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleBooking(booking.bookingId)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  {isExpanded ? 'Hide Schedules' : `View All Schedules (${total})`}
                </button>
              </div>

              {isExpanded && (
                <div className="p-6 bg-gray-50 space-y-5">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Calendar className="text-indigo-600" size={24} />
                    Payment Schedules ({total})
                  </h3>

                  {booking.schedules.map((schedule, index) => {
                    const balance = Number(schedule.BalanceToRecive || 0);
                    const status = getPaymentStatus(schedule);
                    const display = getStatusDisplay(status, (schedule.FollowUp || '').trim().toUpperCase() === 'Y');
                    const key = schedule.paymentId || `${booking.bookingId}-${index}`;

                    const hasPrev = schedule.previousPayments?.length > 0;
                    const totalReceived = hasPrev
                      ? schedule.previousPayments.reduce((sum, p) => sum + (Number(p.PreviousAmountV) || 0), 0)
                      : 0;

                    return (
                      <div key={key} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                                {schedule.projectType || '—'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${display.className}`}>
                                {display.text}
                              </span>
                              {(schedule.FollowUp || '').trim().toUpperCase() === 'Y' && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                  Follow-up Y
                                </span>
                              )}
                            </div>

                            {hasPrev && (
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Total Received: {formatCurrency(totalReceived)}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-500">Planned Date</p>
                              <p className="font-semibold">{formatDate(schedule.Planned)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-bold text-indigo-700">{formatCurrency(schedule.Amount || 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Balance</p>
                              <p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(balance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Follow-up</p>
                              <p className="font-semibold">{schedule.FollowUp || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Payment ID</p>
                              <p className="font-semibold">{schedule.paymentId || '—'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border-t flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => toggleSchedule(key)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition"
                          >
                            {expandedSchedules[key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            {expandedSchedules[key] ? 'Hide Previous' : 'View Previous Info'}
                          </button>

                          <button
                            onClick={() => openActionModal(schedule)}
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Edit3 size={18} />
                                Take Action
                              </>
                            )}
                          </button>
                        </div>

                        {expandedSchedules[key] && (
                          <div className="p-5 border-t bg-gradient-to-br from-gray-50 to-blue-50">
                            <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                              <FileText size={20} className="text-indigo-600" />
                              Previous Payment History
                            </h4>

                            {hasPrev ? (
                              <div className="bg-white rounded-lg shadow overflow-hidden border border-indigo-100">
                                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold uppercase grid grid-cols-12 gap-3 px-4 py-3 sticky top-0">
                                  <div className="col-span-1">#</div>
                                  <div className="col-span-3">Received Date</div>
                                  <div className="col-span-2">Amount</div>
                                  <div className="col-span-3">Next Date</div>
                                  <div className="col-span-3">Remark</div>
                                </div>

                                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                                  {schedule.previousPayments.map((pay, i) => (
                                    <div 
                                      key={i}
                                      className="grid grid-cols-12 gap-3 px-4 py-3.5 text-sm hover:bg-indigo-50/50 transition-colors"
                                    >
                                      <div className="col-span-1 font-medium">{i + 1}</div>
                                      <div className="col-span-3">
                                        {pay.previousReceviedAmountDate 
                                          ? formatDate(pay.previousReceviedAmountDate) 
                                          : '—'}
                                      </div>
                                      <div className="col-span-2">
                                        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded font-medium">
                                          {formatCurrency(pay.PreviousAmountV || 0)}
                                        </span>
                                      </div>
                                      <div className="col-span-3">
                                        {pay.NextDate ? formatDate(pay.NextDate) : '—'}
                                      </div>
                                      <div className="col-span-3 text-gray-700">
                                        {pay.previousRemark || '—'}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-gray-50 px-4 py-3 text-sm flex justify-between border-t">
                                  <span>Total Records: {schedule.previousPayments.length}</span>
                                  <span className="font-bold text-indigo-700">
                                    ₹{totalReceived.toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                                <FileText size={40} className="text-gray-400 mx-auto mb-3" />
                                <h5 className="text-lg font-semibold text-gray-700">No Previous Payments</h5>
                                <p className="text-sm text-gray-500 mt-1">History will appear here once recorded</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Search size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchQuery || filterDate 
                ? 'No results match your search / date filter' 
                : 'No payment schedules available at the moment.'}
            </p>
          </div>
        )}
      </div>

      {showActionModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-t-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Edit3 size={28} />
                    Take Action
                  </h2>
                  <p className="mt-1 opacity-90">
                    {selectedPayment.applicantName} • {selectedPayment.unitNo} • {selectedPayment.bookingId}
                  </p>
                </div>
                <button 
                  onClick={closeActionModal} 
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  disabled={isUpdating}
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-xs text-gray-600">Booking ID</p>
                  <p className="font-semibold">{selectedPayment.bookingId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Unit</p>
                  <p className="font-semibold">{selectedPayment.unitNo || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Planned Date</p>
                  <p className="font-semibold">{formatDate(selectedPayment.Planned)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Schedule Amount</p>
                  <p className="font-semibold text-indigo-700">{formatCurrency(selectedPayment.Amount || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={actionForm.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                    disabled={isUpdating}
                  >
                    <option value="">Select Status</option>
                    <option value="Done">Done</option>
                    <option value="partial">Partial Payment</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {(actionForm.status === 'Done' || actionForm.status === 'partial') && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Date of Receiving
                      </label>
                      <input
                        type="date"
                        name="lastDateOfReceiving"
                        value={actionForm.lastDateOfReceiving || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                        disabled={isUpdating}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount Received <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                        <input
                          type="number"
                          name="amountReceived"
                          value={actionForm.amountReceived || ''}
                          onChange={handleFormChange}
                          placeholder="Enter amount received"
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                          min="0"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  </>
                )}

                {(actionForm.status === 'pending' || actionForm.status === 'partial') && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Next Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="nextDate"
                        value={actionForm.nextDate || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                        disabled={isUpdating}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Remark <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="remark"
                        value={actionForm.remark || ''}
                        onChange={handleFormChange}
                        rows={4}
                        placeholder={actionForm.status === 'partial' ? "Details about partial payment..." : "Follow-up notes / reason..."}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition resize-none"
                        disabled={isUpdating}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-5 flex flex-col sm:flex-row gap-4 justify-end border-t rounded-b-2xl">
              <button
                onClick={closeActionModal}
                disabled={isUpdating}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={isUpdating || !actionForm.status}
                className={`px-8 py-3 text-white font-semibold rounded-lg transition flex items-center gap-2 justify-center min-w-[140px] ${
                  isUpdating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md'
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Action'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePayment;