// import React, { useState, useEffect } from 'react';
// import {
//   useSubmitCapitalMovementMutation,
//   useSubmitBankTransferMutation,
//   useGetDropdownDataQuery
// } from '../../features/SchedulePayment/FormSlice';
// import Swal from 'sweetalert2';

// const Form = () => {
//   const [activeTab, setActiveTab] = useState('transfer');

//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem("isDarkMode");
//     return saved !== null ? JSON.parse(saved) : true;
//   });

//   useEffect(() => {
//     const applyTheme = () => {
//       const saved = localStorage.getItem("isDarkMode");
//       const shouldBeDark = saved !== null ? JSON.parse(saved) : true;

//       setIsDarkMode(shouldBeDark);

//       if (shouldBeDark) {
//         document.documentElement.classList.add("dark");
//       } else {
//         document.documentElement.classList.remove("dark");
//       }
//     };

//     applyTheme();

//     const handleStorageChange = (e) => {
//       if (e.key === "isDarkMode") {
//         applyTheme();
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     const interval = setInterval(applyTheme, 800);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//       clearInterval(interval);
//     };
//   }, []);

//   const [submitCapitalMovement, {
//     isLoading: isSubmittingCapital,
//     isSuccess: capitalSuccess,
//     isError: capitalError,
//     error: capitalErr,
//     data: capitalData
//   }] = useSubmitCapitalMovementMutation();

//   const [submitBankTransfer, {
//     isLoading: isSubmittingTransfer,
//     isSuccess: transferSuccess,
//     isError: transferError,
//     error: transferErr,
//     data: transferData
//   }] = useSubmitBankTransferMutation();

//   const {
//     data: dropdownData,
//     isLoading: isDropdownLoading,
//   } = useGetDropdownDataQuery();

//   const accounts = dropdownData?.accounts || [];
//   const capitalMovements = dropdownData?.capitalMovements || [];

//   const [capitalFormData, setCapitalFormData] = useState({
//     Capital_Movment: '',
//     Received_Account: '',
//     Amount: '',
//     PAYMENT_MODE: '',
//     PAYMENT_DETAILS: '',
//     PAYMENT_DATE: '',
//     Remark: '',
//   });

//   const [transferFormData, setTransferFormData] = useState({
//     Transfer_A_C_Name: '',
//     Transfer_Received_A_C_Name: '',
//     Amount: '',
//     PAYMENT_MODE: '',
//     PAYMENT_DETAILS: '',
//     PAYMENT_DATE: '',
//     Remark: '',
//   });

//   const showCapitalTransactionDetails = ['Cheque', 'NEFT', 'RTGS'].includes(capitalFormData.PAYMENT_MODE);
//   const showTransferTransactionDetails = ['Cheque', 'NEFT', 'RTGS'].includes(transferFormData.PAYMENT_MODE);

//   const handleCapitalChange = (e) => {
//     const { name, value } = e.target;
//     setCapitalFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleTransferChange = (e) => {
//     const { name, value } = e.target;
//     setTransferFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleCapitalSubmit = async () => {
//     if (!capitalFormData.Capital_Movment) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Capital Movement is required' });
//     }
//     if (!capitalFormData.Received_Account) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Received Account is required' });
//     }
//     if (!capitalFormData.Amount || Number(capitalFormData.Amount) <= 0) {
//       return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
//     }
//     if (!capitalFormData.PAYMENT_MODE) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
//     }
//     if (showCapitalTransactionDetails && (!capitalFormData.PAYMENT_DETAILS?.trim() || !capitalFormData.PAYMENT_DATE?.trim())) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details and Date are required for selected mode' });
//     }

//     try {
//       const result = await submitCapitalMovement(capitalFormData).unwrap();

//       Swal.fire({
//         icon: 'success',
//         title: 'Capital Entry Saved!',
//         text: `UID: ${result.data?.UID || 'Generated'}`,
//         confirmButtonColor: '#10b981',
//         timer: 2800,
//         showConfirmButton: false,
//       });

//       setCapitalFormData({
//         Capital_Movment: '',
//         Received_Account: '',
//         Amount: '',
//         PAYMENT_MODE: '',
//         PAYMENT_DETAILS: '',
//         PAYMENT_DATE: '',
//         Remark: '',
//       });
//     } catch (err) {
//       console.error('Capital movement error:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Failed',
//         text: err?.data?.message || 'Failed to save capital movement.',
//       });
//     }
//   };

//   const handleTransferSubmit = async () => {
//     if (!transferFormData.Transfer_A_C_Name) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'From Account is required' });
//     }
//     if (!transferFormData.Transfer_Received_A_C_Name) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'To Account is required' });
//     }
//     if (transferFormData.Transfer_A_C_Name === transferFormData.Transfer_Received_A_C_Name) {
//       return Swal.fire({ icon: 'warning', title: 'Invalid', text: 'From and To accounts cannot be the same' });
//     }
//     if (!transferFormData.Amount || Number(transferFormData.Amount) <= 0) {
//       return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
//     }
//     if (!transferFormData.PAYMENT_MODE) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
//     }
//     if (showTransferTransactionDetails && (!transferFormData.PAYMENT_DETAILS?.trim() || !transferFormData.PAYMENT_DATE?.trim())) {
//       return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details / UTR and Date are required for selected mode' });
//     }

//     try {
//       const payload = {
//         Transfer_A_C_Name: transferFormData.Transfer_A_C_Name,
//         Transfer_Received_A_C_Name: transferFormData.Transfer_Received_A_C_Name,
//         Amount: Number(transferFormData.Amount),
//         PAYMENT_MODE: transferFormData.PAYMENT_MODE,
//         PAYMENT_DETAILS: transferFormData.PAYMENT_DETAILS || '',
//         PAYMENT_DATE: transferFormData.PAYMENT_DATE || '',
//         Remark: transferFormData.Remark || '',
//       };

//       const result = await submitBankTransfer(payload).unwrap();

//       Swal.fire({
//         icon: 'success',
//         title: 'Bank Transfer Saved!',
//         text: `UID: ${result?.data?.UID || 'Generated'}`,
//         confirmButtonColor: '#10b981',
//         timer: 2800,
//         showConfirmButton: false,
//       });

//       setTransferFormData({
//         Transfer_A_C_Name: '',
//         Transfer_Received_A_C_Name: '',
//         Amount: '',
//         PAYMENT_MODE: '',
//         PAYMENT_DETAILS: '',
//         PAYMENT_DATE: '',
//         Remark: '',
//       });
//     } catch (err) {
//       console.error('Bank transfer error:', err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Failed',
//         text: err?.data?.message || 'Failed to submit bank transfer.',
//       });
//     }
//   };

//   return (
//     <div className={`min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 lg:px-10 xl:px-12 ${
//       isDarkMode ? 'bg-gradient-to-br from-black via-indigo-950 to-purple-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
//     }`}>
//       {isDarkMode && (
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-purple-700 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse-slow"></div>
//           <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-blue-700 rounded-full mix-blend-multiply blur-3xl opacity-25 animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
//           <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-indigo-800 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '6s' }}></div>
//         </div>
//       )}

//       <div className="absolute inset-0 pointer-events-none">
//         {[...Array(25)].map((_, i) => (
//           <div
//             key={i}
//             className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full opacity-20 ${
//               isDarkMode ? 'bg-white' : 'bg-gray-900'
//             }`}
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animation: `float ${10 + Math.random() * 15}s linear infinite`,
//               animationDelay: `${Math.random() * 12}s`,
//             }}
//           />
//         ))}
//       </div>

//       <div className="relative z-10 w-full max-w-screen-2xl mx-auto">
//         <div className={`bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden ${
//           isDarkMode ? 'border-white/10' : 'border-gray-200'
//         }`}>
//           <div className={`px-6 py-8 sm:px-10 md:px-12 lg:px-16 border-b ${
//             isDarkMode ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 border-indigo-700/40' : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-gray-300'
//           }`}>
//             <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent text-center ${
//               isDarkMode ? 'from-indigo-200 via-purple-200 to-indigo-200' : 'from-indigo-600 via-purple-600 to-indigo-600'
//             }`}>
//               Payment Management
//             </h2>
//             <p className={`text-center mt-3 text-base sm:text-lg md:text-xl ${
//               isDarkMode ? 'text-indigo-300/80' : 'text-indigo-700/80'
//             }`}>
//               Manage bank transfer and capital account entries
//             </p>
//           </div>

//           <div className={`flex border-b ${
//             isDarkMode ? 'border-indigo-700/40 bg-black/20' : 'border-gray-300 bg-gray-50/20'
//           }`}>
//             <button
//               onClick={() => setActiveTab('transfer')}
//               className={`flex-1 py-5 text-center font-semibold text-base sm:text-lg transition-all ${
//                 activeTab === 'transfer'
//                   ? isDarkMode
//                     ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-purple-200 border-b-4 border-purple-500'
//                     : 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-b-4 border-purple-500'
//                   : isDarkMode
//                     ? 'text-gray-300 hover:bg-white/5 hover:text-white'
//                     : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
//               }`}
//             >
//               Bank Transfer
//             </button>

//             <button
//               onClick={() => setActiveTab('capital')}
//               className={`flex-1 py-5 text-center font-semibold text-base sm:text-lg transition-all ${
//                 activeTab === 'capital'
//                   ? isDarkMode
//                     ? 'bg-gradient-to-r from-amber-900/60 to-yellow-900/60 text-amber-200 border-b-4 border-amber-500'
//                     : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-b-4 border-amber-500'
//                   : isDarkMode
//                     ? 'text-gray-300 hover:bg-white/5 hover:text-white'
//                     : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
//               }`}
//             >
//               Capital A/C
//             </button>
//           </div>

//           <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 space-y-8 lg:space-y-10">

//             {activeTab === 'transfer' && (
//               <div className="space-y-7 lg:space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Transfer A/C Name (From) <span className="text-red-400">*</span>
//                     </label>
//                     {isDropdownLoading ? (
//                       <div className={isDarkMode ? "text-indigo-300 italic" : "text-indigo-600 italic"}>Loading accounts...</div>
//                     ) : (
//                       <select
//                         name="Transfer_A_C_Name"
//                         value={transferFormData.Transfer_A_C_Name}
//                         onChange={handleTransferChange}
//                         className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                       >
//                         <option value="">-- Select Account --</option>
//                         {accounts.map((acc, i) => (
//                           <option key={i} value={acc}>{acc}</option>
//                         ))}
//                       </select>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Transfer Received A/C Name (To) <span className="text-red-400">*</span>
//                     </label>
//                     <select
//                       name="Transfer_Received_A_C_Name"
//                       value={transferFormData.Transfer_Received_A_C_Name}
//                       onChange={handleTransferChange}
//                       className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                         isDarkMode
//                           ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                           : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                       }`}
//                     >
//                       <option value="">-- Select Account --</option>
//                       {accounts.map((acc, i) => (
//                         <option key={i} value={acc}>{acc}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Amount <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium text-lg ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-600'
//                       }`}>₹</span>
//                       <input
//                         type="number"
//                         name="Amount"
//                         value={transferFormData.Amount}
//                         onChange={handleTransferChange}
//                         min="1"
//                         step="0.01"
//                         className={`w-full pl-12 pr-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Payment Mode <span className="text-red-400">*</span>
//                     </label>
//                     <select
//                       name="PAYMENT_MODE"
//                       value={transferFormData.PAYMENT_MODE}
//                       onChange={handleTransferChange}
//                       className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                         isDarkMode
//                           ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                           : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                       }`}
//                     >
//                       <option value="">---- Select ----</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="NEFT">NEFT</option>
//                       <option value="RTGS">RTGS</option>
//                     </select>
//                   </div>
//                 </div>

//                 {showTransferTransactionDetails && (
//                   <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-6 rounded-xl border ${
//                     isDarkMode ? 'bg-black/30 border-indigo-800/40' : 'bg-gray-50 border-gray-300'
//                   }`}>
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                         {transferFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'UTR No / Ref No'} <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="PAYMENT_DETAILS"
//                         value={transferFormData.PAYMENT_DETAILS}
//                         onChange={handleTransferChange}
//                         className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                         Payment Date <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="PAYMENT_DATE"
//                         value={transferFormData.PAYMENT_DATE}
//                         onChange={handleTransferChange}
//                         className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Remark (Optional)</label>
//                   <textarea
//                     name="Remark"
//                     value={transferFormData.Remark}
//                     onChange={handleTransferChange}
//                     rows="4"
//                     className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 resize-y min-h-[120px] text-base ${
//                       isDarkMode
//                         ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                         : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                     }`}
//                     placeholder="Any additional notes..."
//                   />
//                 </div>

//                 <button
//                   onClick={handleTransferSubmit}
//                   disabled={isSubmittingTransfer}
//                   className={`w-full py-5 sm:py-6 mt-6 lg:mt-8 text-white font-bold rounded-xl text-lg sm:text-xl transition-all transform shadow-xl ${
//                     isSubmittingTransfer
//                       ? 'bg-gray-700 cursor-not-allowed'
//                       : isDarkMode
//                         ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-[1.02]'
//                         : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 hover:shadow-2xl hover:scale-[1.02]'
//                   }`}
//                 >
//                   {isSubmittingTransfer ? 'Submitting Transfer...' : '✓ Submit Bank Transfer'}
//                 </button>

//                 {transferError && (
//                   <div className={`p-6 lg:p-8 border rounded-xl text-center ${
//                     isDarkMode ? 'bg-red-900/40 border-red-700/50' : 'bg-red-50 border-red-300'
//                   }`}>
//                     <p className={`font-bold text-xl lg:text-2xl ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
//                       ✗ {transferErr?.data?.message || 'Failed to submit transfer'}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'capital' && (
//               <div className="space-y-7 lg:space-y-8">
//                 <div className="space-y-2">
//                   <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                     Capital Movement <span className="text-red-400">*</span>
//                   </label>
//                   {isDropdownLoading ? (
//                     <div className={isDarkMode ? "text-indigo-300 italic" : "text-indigo-600 italic"}>Loading movements...</div>
//                   ) : (
//                     <select
//                       name="Capital_Movment"
//                       value={capitalFormData.Capital_Movment}
//                       onChange={handleCapitalChange}
//                       className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                         isDarkMode
//                           ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                           : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                       }`}
//                     >
//                       <option value="">-- Select Movement --</option>
//                       {capitalMovements.map((item, i) => (
//                         <option key={i} value={item}>{item}</option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                     Received Account <span className="text-red-400">*</span>
//                   </label>
//                   {isDropdownLoading ? (
//                     <div className={isDarkMode ? "text-indigo-300 italic" : "text-indigo-600 italic"}>Loading accounts...</div>
//                   ) : (
//                     <select
//                       name="Received_Account"
//                       value={capitalFormData.Received_Account}
//                       onChange={handleCapitalChange}
//                       className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                         isDarkMode
//                           ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                           : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                       }`}
//                     >
//                       <option value="">-- Select Account --</option>
//                       {accounts.map((acc, i) => (
//                         <option key={i} value={acc}>{acc}</option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Amount <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium text-lg ${
//                         isDarkMode ? 'text-gray-400' : 'text-gray-600'
//                       }`}>₹</span>
//                       <input
//                         type="number"
//                         name="Amount"
//                         value={capitalFormData.Amount}
//                         onChange={handleCapitalChange}
//                         min="1"
//                         step="0.01"
//                         className={`w-full pl-12 pr-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-lg ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                         placeholder="0.00"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                       Payment Mode <span className="text-red-400">*</span>
//                     </label>
//                     <select
//                       name="PAYMENT_MODE"
//                       value={capitalFormData.PAYMENT_MODE}
//                       onChange={handleCapitalChange}
//                       className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                         isDarkMode
//                           ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                           : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                       }`}
//                     >
//                       <option value="">---- Select ----</option>
//                       <option value="Cash">Cash</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="NEFT">NEFT</option>
//                       <option value="RTGS">RTGS</option>
//                       <option value="UPI">UPI</option>
//                     </select>
//                   </div>
//                 </div>

//                 {showCapitalTransactionDetails && (
//                   <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-6 rounded-xl border ${
//                     isDarkMode ? 'bg-black/30 border-indigo-800/40' : 'bg-gray-50 border-gray-300'
//                   }`}>
//                     <div className="space-y-2">
//                       <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                         {capitalFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'Payment Details / UTR No'} <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="PAYMENT_DETAILS"
//                         value={capitalFormData.PAYMENT_DETAILS}
//                         onChange={handleCapitalChange}
//                         className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
//                         Payment Date <span className="text-red-400">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         name="PAYMENT_DATE"
//                         value={capitalFormData.PAYMENT_DATE}
//                         onChange={handleCapitalChange}
//                         className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${
//                           isDarkMode
//                             ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                             : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                         }`}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="space-y-2">
//                   <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Remark (Optional)</label>
//                   <textarea
//                     name="Remark"
//                     value={capitalFormData.Remark}
//                     onChange={handleCapitalChange}
//                     rows="4"
//                     className={`w-full px-5 py-3.5 border rounded-lg focus:outline-none focus:ring-2 resize-y min-h-[120px] text-base ${
//                       isDarkMode
//                         ? 'bg-gray-900/70 border-indigo-600/50 text-gray-200 focus:ring-indigo-500'
//                         : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-400'
//                     }`}
//                     placeholder="Any additional notes or reference..."
//                   />
//                 </div>

//                 <button
//                   onClick={handleCapitalSubmit}
//                   disabled={isSubmittingCapital}
//                   className={`w-full py-5 sm:py-6 mt-6 lg:mt-8 text-white font-bold rounded-xl text-lg sm:text-xl transition-all transform shadow-xl ${
//                     isSubmittingCapital
//                       ? 'bg-gray-700 cursor-not-allowed'
//                       : isDarkMode
//                         ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 hover:shadow-2xl hover:scale-[1.02]'
//                         : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:shadow-2xl hover:scale-[1.02]'
//                   }`}
//                 >
//                   {isSubmittingCapital ? 'Saving Capital Entry...' : '✓ Save Capital Movement'}
//                 </button>

//                 {capitalError && (
//                   <div className={`p-6 lg:p-8 border rounded-xl text-center ${
//                     isDarkMode ? 'bg-red-900/40 border-red-700/50' : 'bg-red-50 border-red-300'
//                   }`}>
//                     <p className={`font-bold text-xl lg:text-2xl ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
//                       ✗ {capitalErr?.data?.message || 'Failed to save capital entry'}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes float {
//           0%, 100% { transform: translate(0, 0); }
//           50% { transform: translate(30px, -60px); }
//         }
//         .animate-pulse-slow {
//           animation: pulse 18s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 0.25; transform: scale(1); }
//           50% { opacity: 0.45; transform: scale(1.1); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Form;




import React, { useState } from 'react';
import {
  useSubmitCapitalMovementMutation,
  useSubmitBankTransferMutation,
  useGetDropdownDataQuery
} from '../../features/SchedulePayment/FormSlice';
import Swal from 'sweetalert2';

const Form = () => {
  const [activeTab, setActiveTab] = useState('transfer');

  const [submitCapitalMovement, {
    isLoading: isSubmittingCapital,
    isError: capitalError,
    error: capitalErr,
  }] = useSubmitCapitalMovementMutation();

  const [submitBankTransfer, {
    isLoading: isSubmittingTransfer,
    isError: transferError,
    error: transferErr,
  }] = useSubmitBankTransferMutation();

  const {
    data: dropdownData,
    isLoading: isDropdownLoading,
  } = useGetDropdownDataQuery();

  const accounts = dropdownData?.accounts || [];
  const capitalMovements = dropdownData?.capitalMovements || [];

  const [capitalFormData, setCapitalFormData] = useState({
    Capital_Movment: '',
    Received_Account: '',
    Amount: '',
    PAYMENT_MODE: '',
    PAYMENT_DETAILS: '',
    PAYMENT_DATE: '',
    Remark: '',
  });

  const [transferFormData, setTransferFormData] = useState({
    Transfer_A_C_Name: '',
    Transfer_Received_A_C_Name: '',
    Amount: '',
    PAYMENT_MODE: '',
    PAYMENT_DETAILS: '',
    PAYMENT_DATE: '',
    Remark: '',
  });

  const showCapitalTransactionDetails = ['Cheque', 'NEFT', 'RTGS', 'UPI'].includes(capitalFormData.PAYMENT_MODE);
  const showTransferTransactionDetails = ['Cheque', 'NEFT', 'RTGS'].includes(transferFormData.PAYMENT_MODE);

  const handleCapitalChange = (e) => {
    const { name, value } = e.target;
    setCapitalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapitalSubmit = async () => {
    if (!capitalFormData.Capital_Movment) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Capital Movement is required' });
    }
    if (!capitalFormData.Received_Account) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Received Account is required' });
    }
    if (!capitalFormData.Amount || Number(capitalFormData.Amount) <= 0) {
      return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
    }
    if (!capitalFormData.PAYMENT_MODE) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
    }
    if (showCapitalTransactionDetails && (!capitalFormData.PAYMENT_DETAILS?.trim() || !capitalFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details and Date are required for selected mode' });
    }

    try {
      const result = await submitCapitalMovement(capitalFormData).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Capital Entry Saved!',
        text: `UID: ${result.data?.UID || 'Generated'}`,
        confirmButtonColor: '#10b981',
        timer: 2500,
        showConfirmButton: false,
      });

      setCapitalFormData({
        Capital_Movment: '',
        Received_Account: '',
        Amount: '',
        PAYMENT_MODE: '',
        PAYMENT_DETAILS: '',
        PAYMENT_DATE: '',
        Remark: '',
      });
    } catch (err) {
      console.error('Capital movement error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err?.data?.message || 'Failed to save capital movement.',
      });
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferFormData.Transfer_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'From Account is required' });
    }
    if (!transferFormData.Transfer_Received_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'To Account is required' });
    }
    if (transferFormData.Transfer_A_C_Name === transferFormData.Transfer_Received_A_C_Name) {
      return Swal.fire({ icon: 'warning', title: 'Invalid', text: 'From and To accounts cannot be the same' });
    }
    if (!transferFormData.Amount || Number(transferFormData.Amount) <= 0) {
      return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Valid Amount is required' });
    }
    if (!transferFormData.PAYMENT_MODE) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Mode is required' });
    }
    if (showTransferTransactionDetails && (!transferFormData.PAYMENT_DETAILS?.trim() || !transferFormData.PAYMENT_DATE?.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Required', text: 'Payment Details / UTR and Date are required for selected mode' });
    }

    try {
      const payload = {
        Transfer_A_C_Name: transferFormData.Transfer_A_C_Name,
        Transfer_Received_A_C_Name: transferFormData.Transfer_Received_A_C_Name,
        Amount: Number(transferFormData.Amount),
        PAYMENT_MODE: transferFormData.PAYMENT_MODE,
        PAYMENT_DETAILS: transferFormData.PAYMENT_DETAILS || '',
        PAYMENT_DATE: transferFormData.PAYMENT_DATE || '',
        Remark: transferFormData.Remark || '',
      };

      const result = await submitBankTransfer(payload).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Bank Transfer Saved!',
        text: `UID: ${result?.data?.UID || 'Generated'}`,
        confirmButtonColor: '#10b981',
        timer: 2500,
        showConfirmButton: false,
      });

      setTransferFormData({
        Transfer_A_C_Name: '',
        Transfer_Received_A_C_Name: '',
        Amount: '',
        PAYMENT_MODE: '',
        PAYMENT_DETAILS: '',
        PAYMENT_DATE: '',
        Remark: '',
      });
    } catch (err) {
      console.error('Bank transfer error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err?.data?.message || 'Failed to submit bank transfer.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-8 sm:px-10 md:px-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center">
              Payment Management
            </h2>
            <p className="text-center mt-3 text-indigo-100 text-base sm:text-lg">
              Manage bank transfer and capital account entries
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 py-4 text-center font-semibold text-base sm:text-lg transition-all duration-200 ${
                activeTab === 'transfer'
                  ? 'bg-white text-indigo-700 border-b-4 border-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              Bank Transfer
            </button>

            <button
              onClick={() => setActiveTab('capital')}
              className={`flex-1 py-4 text-center font-semibold text-base sm:text-lg transition-all duration-200 ${
                activeTab === 'capital'
                  ? 'bg-white text-amber-700 border-b-4 border-amber-500 shadow-sm'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              Capital A/C
            </button>
          </div>

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">

            {/* BANK TRANSFER */}
            {activeTab === 'transfer' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Transfer A/C Name (From) <span className="text-red-500">*</span>
                    </label>
                    {isDropdownLoading ? (
                      <div className="text-indigo-600 italic">Loading accounts...</div>
                    ) : (
                      <select
                        name="Transfer_A_C_Name"
                        value={transferFormData.Transfer_A_C_Name}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      >
                        <option value="">-- Select Account --</option>
                        {accounts.map((acc, i) => (
                          <option key={i} value={acc}>{acc}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Transfer Received A/C Name (To) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="Transfer_Received_A_C_Name"
                      value={transferFormData.Transfer_Received_A_C_Name}
                      onChange={handleTransferChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map((acc, i) => (
                        <option key={i} value={acc}>{acc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="Amount"
                        value={transferFormData.Amount}
                        onChange={handleTransferChange}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="PAYMENT_MODE"
                      value={transferFormData.PAYMENT_MODE}
                      onChange={handleTransferChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    >
                      <option value="">---- Select ----</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                    </select>
                  </div>
                </div>

                {showTransferTransactionDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {transferFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'UTR No / Ref No'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="PAYMENT_DETAILS"
                        value={transferFormData.PAYMENT_DETAILS}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="PAYMENT_DATE"
                        value={transferFormData.PAYMENT_DATE}
                        onChange={handleTransferChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    name="Remark"
                    value={transferFormData.Remark}
                    onChange={handleTransferChange}
                    rows="4"
                    placeholder="Any additional notes..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 resize-y min-h-[120px]"
                  />
                </div>

                <button
                  onClick={handleTransferSubmit}
                  disabled={isSubmittingTransfer}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${
                    isSubmittingTransfer
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                  }`}
                >
                  {isSubmittingTransfer ? 'Submitting Transfer...' : '✓ Submit Bank Transfer'}
                </button>

                {transferError && (
                  <div className="p-5 border border-red-200 rounded-2xl bg-red-50 text-center">
                    <p className="font-semibold text-red-700">
                      ✗ {transferErr?.data?.message || 'Failed to submit transfer'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CAPITAL A/C */}
            {activeTab === 'capital' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Capital Movement <span className="text-red-500">*</span>
                  </label>
                  {isDropdownLoading ? (
                    <div className="text-indigo-600 italic">Loading movements...</div>
                  ) : (
                    <select
                      name="Capital_Movment"
                      value={capitalFormData.Capital_Movment}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">-- Select Movement --</option>
                      {capitalMovements.map((item, i) => (
                        <option key={i} value={item}>{item}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Received Account <span className="text-red-500">*</span>
                  </label>
                  {isDropdownLoading ? (
                    <div className="text-indigo-600 italic">Loading accounts...</div>
                  ) : (
                    <select
                      name="Received_Account"
                      value={capitalFormData.Received_Account}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">-- Select Account --</option>
                      {accounts.map((acc, i) => (
                        <option key={i} value={acc}>{acc}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="Amount"
                        value={capitalFormData.Amount}
                        onChange={handleCapitalChange}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="PAYMENT_MODE"
                      value={capitalFormData.PAYMENT_MODE}
                      onChange={handleCapitalChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                    >
                      <option value="">---- Select ----</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {showCapitalTransactionDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {capitalFormData.PAYMENT_MODE === 'Cheque' ? 'Cheque No' : 'Payment Details / UTR No'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="PAYMENT_DETAILS"
                        value={capitalFormData.PAYMENT_DETAILS}
                        onChange={handleCapitalChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="PAYMENT_DATE"
                        value={capitalFormData.PAYMENT_DATE}
                        onChange={handleCapitalChange}
                        className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Remark (Optional)
                  </label>
                  <textarea
                    name="Remark"
                    value={capitalFormData.Remark}
                    onChange={handleCapitalChange}
                    rows="4"
                    placeholder="Any additional notes or reference..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-800 resize-y min-h-[120px]"
                  />
                </div>

                <button
                  onClick={handleCapitalSubmit}
                  disabled={isSubmittingCapital}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg ${
                    isSubmittingCapital
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                  }`}
                >
                  {isSubmittingCapital ? 'Saving Capital Entry...' : '✓ Save Capital Movement'}
                </button>

                {capitalError && (
                  <div className="p-5 border border-red-200 rounded-2xl bg-red-50 text-center">
                    <p className="font-semibold text-red-700">
                      ✗ {capitalErr?.data?.message || 'Failed to save capital entry'}
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;