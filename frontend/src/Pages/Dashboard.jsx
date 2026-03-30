

// import React, { useState, useEffect, useRef } from "react";
// import { BarChart3, DollarSign, LogOut, Menu, X, ChevronDown } from "lucide-react";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/Auth/LoginSlice";

// const Dashboard = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
//   const [isMobilePaymentDropdownOpen, setIsMobilePaymentDropdownOpen] = useState(false);

//   const dropdownRef = useRef(null);
//   const { token, userType } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const currentUserType = (userType || "").trim().toUpperCase();

//   const isAdmin = currentUserType === "ADMIN";
//   const isCRM   = currentUserType === "CRM";

//   // Menu visibility – ab sirf Summary aur Payment
//   const canSeeSummary = isAdmin;
//   const canSeePayment = isAdmin || isCRM || currentUserType === "ACCOUNTS" || currentUserType === "FINANCE";

//   // Payment sub-items control
//   const canSeeSchedulePayment = isAdmin || isCRM || currentUserType === "ACCOUNTS" || currentUserType === "FINANCE";
//   const canSeeActualBooking   = isAdmin || currentUserType === "ACCOUNTS" || currentUserType === "MANAGER";

//   // Highlight states (leads wala hata diya)
//   const [isSummarySelected, setIsSummarySelected] = useState(false);
//   const [isPaymentSelected, setIsPaymentSelected] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//       return;
//     }

//     // Default redirect – ab sirf summary ya payment pe
//     if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
//       if (canSeeSummary) {
//         navigate("/dashboard/summary", { replace: true });
//       } else if (canSeePayment && canSeeSchedulePayment) {
//         navigate("/dashboard/SchedulePayment", { replace: true });
//       } else if (canSeePayment && canSeeActualBooking) {
//         navigate("/dashboard/ActualBooking", { replace: true });
//       } else {
//         navigate("/", { replace: true });
//       }
//     }
//   }, [token, location.pathname, navigate]);

//   useEffect(() => {
//     const path = location.pathname;

//     setIsSummarySelected(path === "/dashboard/summary");
//     setIsPaymentSelected(
//       path.startsWith("/dashboard/SchedulePayment") ||
//       path === "/dashboard/SchedulePayment" ||
//       path.startsWith("/dashboard/ActualBooking") ||
//       path === "/dashboard/ActualBooking"
//     );
//   }, [location.pathname]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsPaymentDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const goToSummary = () => {
//     if (!canSeeSummary) return;
//     setIsMobileMenuOpen(false);
//     navigate("/dashboard/summary");
//   };

//   const goToSchedulePayment = () => {
//     if (!canSeeSchedulePayment) return;
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/SchedulePayment");
//   };

//   const goToActualBookingAmount = () => {
//     if (!canSeeActualBooking) return;
//     setIsMobileMenuOpen(false);
//     setIsPaymentDropdownOpen(false);
//     setIsMobilePaymentDropdownOpen(false);
//     navigate("/dashboard/ActualBooking");
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   const togglePaymentDropdown = () => {
//     if (!canSeePayment) return;
//     setIsPaymentDropdownOpen(!isPaymentDropdownOpen);
//   };

//   const toggleMobilePaymentDropdown = () => {
//     if (!canSeePayment) return;
//     setIsMobilePaymentDropdownOpen(!isMobilePaymentDropdownOpen);
//   };

//   const hasPaymentSubItems = canSeeSchedulePayment || canSeeActualBooking;

//   return (
//     <div className="min-h-screen w-full bg-[#1A3263] overflow-x-hidden">
//       {/* NAVBAR */}
//       <nav
//         className="bg-[#1A3263] border-b border-gray-800 fixed top-0 left-0 right-0 z-50"
//         style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", height: "64px" }}
//       >
//         <div className="w-full px-3 sm:px-4 lg:px-6 h-full">
//           <div className="flex items-center justify-between h-full">
//             <div className="flex items-center gap-3">
//               <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
//                 VRN Office
//               </h1>
//             </div>

//             {/* Desktop Menu */}
//             <div className="hidden lg:flex items-center gap-6">
//               {canSeeSummary && (
//                 <button
//                   onClick={goToSummary}
//                   className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                     isSummarySelected ? "bg-amber-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800"
//                   }`}
//                 >
//                   <BarChart3 size={18} />
//                   Summary
//                 </button>
//               )}

//               {canSeePayment && (
//                 <div className="relative" ref={dropdownRef}>
//                   <button
//                     onClick={togglePaymentDropdown}
//                     className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
//                       isPaymentSelected ? "bg-emerald-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <DollarSign size={18} />
//                     Payment
//                     {hasPaymentSubItems && (
//                       <ChevronDown
//                         size={16}
//                         className={`transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
//                       />
//                     )}
//                   </button>

//                   {isPaymentDropdownOpen && hasPaymentSubItems && (
//                     <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
//                       {canSeeSchedulePayment && (
//                         <button
//                           onClick={goToSchedulePayment}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
//                         >
//                           Schedule Payment
//                         </button>
//                       )}
//                       {canSeeActualBooking && (
//                         <button
//                           onClick={goToActualBookingAmount}
//                           className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
//                         >
//                           Actual Booking Amount
//                         </button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Logout Desktop */}
//             <div className="hidden lg:flex items-center">
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 px-5 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition-all text-sm font-medium"
//               >
//                 <LogOut size={18} />
//                 Logout
//               </button>
//             </div>

//             {/* Mobile Hamburger */}
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
//             >
//               <Menu className="w-6 h-6 text-gray-300" />
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Sidebar */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//           <div className="fixed inset-y-0 right-0 w-72 bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between p-5 border-b border-gray-800">
//                 <h2 className="text-lg font-bold text-white">Menu</h2>
//                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
//                   <X className="w-6 h-6 text-gray-300" />
//                 </button>
//               </div>

//               <div className="flex-1 p-5 space-y-4 overflow-y-auto">
//                 {canSeeSummary && (
//                   <button
//                     onClick={goToSummary}
//                     className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
//                       isSummarySelected ? "bg-amber-600/25 text-amber-400 border-l-4 border-amber-500" : "text-gray-300 hover:bg-gray-800"
//                     }`}
//                   >
//                     <BarChart3 size={22} />
//                     <span className="font-medium">Summary</span>
//                   </button>
//                 )}

//                 {canSeePayment && (
//                   <div className="w-full">
//                     <button
//                       onClick={toggleMobilePaymentDropdown}
//                       className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
//                         isPaymentSelected ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500" : "text-gray-300 hover:bg-gray-800"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <DollarSign size={22} />
//                         <span className="font-medium">Payment</span>
//                       </div>
//                       {hasPaymentSubItems && (
//                         <ChevronDown
//                           size={18}
//                           className={`transition-transform ${isMobilePaymentDropdownOpen ? "rotate-180" : ""}`}
//                         />
//                       )}
//                     </button>

//                     {isMobilePaymentDropdownOpen && hasPaymentSubItems && (
//                       <div className="mt-2 ml-4 space-y-2">
//                         {canSeeSchedulePayment && (
//                           <button
//                             onClick={goToSchedulePayment}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Schedule Payment
//                           </button>
//                         )}
//                         {canSeeActualBooking && (
//                           <button
//                             onClick={goToActualBookingAmount}
//                             className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
//                           >
//                             Actual Booking Amount
//                           </button>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="p-5 border-t border-gray-800">
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
//                 >
//                   <LogOut size={22} />
//                   <span className="font-medium">Logout</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Main Content */}
//       <main className="w-full pt-16 px-3 sm:px-4 lg:px-5 pb-4">
//         <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)] w-full">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;





import React, { useState, useEffect, useRef } from "react";
import { BarChart3, DollarSign, LogOut, Menu, X, ChevronDown, Building2 } from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/Auth/LoginSlice";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [isMobilePaymentDropdownOpen, setIsMobilePaymentDropdownOpen] = useState(false);
  const [isOfficeDropdownOpen, setIsOfficeDropdownOpen] = useState(false);
  const [isMobileOfficeDropdownOpen, setIsMobileOfficeDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const officeDropdownRef = useRef(null);
  const { token, userType } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserType = (userType || "").trim().toUpperCase();

  const isAdmin = currentUserType === "ADMIN";
  const isCRM = currentUserType === "CRM";

  const canSeeSummary = isAdmin;
  const canSeePayment = isAdmin || isCRM || currentUserType === "ACCOUNTS" || currentUserType === "FINANCE";
  const canSeeOffice = isAdmin || isCRM || currentUserType === "ACCOUNTS" || currentUserType === "FINANCE";

  const canSeeSchedulePayment = isAdmin || isCRM || currentUserType === "ACCOUNTS" || currentUserType === "FINANCE";
  const canSeeActualBooking = isAdmin || currentUserType === "ACCOUNTS" || currentUserType === "MANAGER";

  const [isSummarySelected, setIsSummarySelected] = useState(false);
  const [isPaymentSelected, setIsPaymentSelected] = useState(false);
  const [isOfficeSelected, setIsOfficeSelected] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      if (canSeeSummary) {
        navigate("/dashboard/summary", { replace: true });
      } else if (canSeePayment && canSeeSchedulePayment) {
        navigate("/dashboard/SchedulePayment", { replace: true });
      } else if (canSeePayment && canSeeActualBooking) {
        navigate("/dashboard/ActualBooking", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [token, location.pathname, navigate]);

  useEffect(() => {
    const path = location.pathname;

    setIsSummarySelected(path === "/dashboard/summary");
    setIsPaymentSelected(
      path.startsWith("/dashboard/SchedulePayment") ||
      path.startsWith("/dashboard/ActualBooking")
    );
    setIsOfficeSelected(
      path.startsWith("/dashboard/Approvel1") ||
      path.startsWith("/dashboard/BillEntry") ||
      path.startsWith("/dashboard/ExpensesPayment")
    );
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
      if (officeDropdownRef.current && !officeDropdownRef.current.contains(event.target)) {
        setIsOfficeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSummary = () => {
    if (!canSeeSummary) return;
    setIsMobileMenuOpen(false);
    navigate("/dashboard/summary");
  };

  const goToSchedulePayment = () => {
    if (!canSeeSchedulePayment) return;
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/SchedulePayment");
  };

  const goToActualBookingAmount = () => {
    if (!canSeeActualBooking) return;
    setIsMobileMenuOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsMobilePaymentDropdownOpen(false);
    navigate("/dashboard/ActualBooking");
  };

  // Office navigation functions
  const goToApprovel = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/Approvel1");
  };

  const goToBillEntry = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/BillEntry");
  };

  const goToExpensesPayment = () => {
    setIsMobileMenuOpen(false);
    setIsOfficeDropdownOpen(false);
    setIsMobileOfficeDropdownOpen(false);
    navigate("/dashboard/ExpensesPayment");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const togglePaymentDropdown = () => {
    if (!canSeePayment) return;
    setIsPaymentDropdownOpen(!isPaymentDropdownOpen);
    setIsOfficeDropdownOpen(false);
  };

  const toggleOfficeDropdown = () => {
    if (!canSeeOffice) return;
    setIsOfficeDropdownOpen(!isOfficeDropdownOpen);
    setIsPaymentDropdownOpen(false);
  };

  const toggleMobilePaymentDropdown = () => {
    if (!canSeePayment) return;
    setIsMobilePaymentDropdownOpen(!isMobilePaymentDropdownOpen);
  };

  const toggleMobileOfficeDropdown = () => {
    if (!canSeeOffice) return;
    setIsMobileOfficeDropdownOpen(!isMobileOfficeDropdownOpen);
  };

  const hasPaymentSubItems = canSeeSchedulePayment || canSeeActualBooking;

  return (
    <div className="min-h-screen w-full bg-[#1A3263] overflow-x-hidden">
      {/* NAVBAR */}
      <nav
        className="bg-[#1A3263] border-b border-gray-800 fixed top-0 left-0 right-0 z-50"
        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", height: "64px" }}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                VRN Office
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              {canSeeSummary && (
                <button
                  onClick={goToSummary}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSummarySelected ? "bg-amber-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <BarChart3 size={18} />
                  Summary
                </button>
              )}

              {/* Office Dropdown - Desktop */}
              {canSeeOffice && (
                <div className="relative" ref={officeDropdownRef}>
                  <button
                    onClick={toggleOfficeDropdown}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isOfficeSelected ? "bg-blue-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <Building2 size={18} />
                    Office
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOfficeDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOfficeDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                      <button
                        onClick={goToApprovel}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                      >
                        Approval
                      </button>
                      <button
                        onClick={goToBillEntry}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                      >
                        Bill Entry
                      </button>
                      <button
                        onClick={goToExpensesPayment}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                      >
                        Expenses Payment
                      </button>
                    </div>
                  )}
                </div>
              )}

              {canSeePayment && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={togglePaymentDropdown}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isPaymentSelected ? "bg-emerald-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <DollarSign size={18} />
                    Payment
                    {hasPaymentSubItems && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {isPaymentDropdownOpen && hasPaymentSubItems && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
                      {canSeeSchedulePayment && (
                        <button
                          onClick={goToSchedulePayment}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium border-b border-gray-800"
                        >
                          Schedule Payment
                        </button>
                      )}
                      {canSeeActualBooking && (
                        <button
                          onClick={goToActualBookingAmount}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
                        >
                          Actual Booking Amount
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout Desktop */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                {canSeeSummary && (
                  <button
                    onClick={goToSummary}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
                      isSummarySelected ? "bg-amber-600/25 text-amber-400 border-l-4 border-amber-500" : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    <BarChart3 size={22} />
                    <span className="font-medium">Summary</span>
                  </button>
                )}

                {/* Office Dropdown - Mobile */}
                {canSeeOffice && (
                  <div className="w-full">
                    <button
                      onClick={toggleMobileOfficeDropdown}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
                        isOfficeSelected ? "bg-blue-600/25 text-blue-400 border-l-4 border-blue-500" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={22} />
                        <span className="font-medium">Office</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${isMobileOfficeDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobileOfficeDropdownOpen && (
                      <div className="mt-2 ml-4 space-y-2">
                        <button
                          onClick={goToApprovel}
                          className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                        >
                          Approval
                        </button>
                        <button
                          onClick={goToBillEntry}
                          className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                        >
                          Bill Entry
                        </button>
                        <button
                          onClick={goToExpensesPayment}
                          className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                        >
                          Expenses Payment
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {canSeePayment && (
                  <div className="w-full">
                    <button
                      onClick={toggleMobilePaymentDropdown}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-lg transition-all ${
                        isPaymentSelected ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign size={22} />
                        <span className="font-medium">Payment</span>
                      </div>
                      {hasPaymentSubItems && (
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${isMobilePaymentDropdownOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {isMobilePaymentDropdownOpen && hasPaymentSubItems && (
                      <div className="mt-2 ml-4 space-y-2">
                        {canSeeSchedulePayment && (
                          <button
                            onClick={goToSchedulePayment}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Schedule Payment
                          </button>
                        )}
                        {canSeeActualBooking && (
                          <button
                            onClick={goToActualBookingAmount}
                            className="w-full text-left px-5 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-sm"
                          >
                            Actual Booking Amount
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-red-400 transition-colors"
                >
                  <LogOut size={22} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="w-full pt-16 px-3 sm:px-4 lg:px-5 pb-4">
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)] w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;