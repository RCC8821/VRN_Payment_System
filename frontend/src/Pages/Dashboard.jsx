
// import React, { useState, useEffect, useRef } from "react";
// import {
//   DollarSign,
//   ChevronDown,
//   LogOut,
//   Menu,
//   X,
//   User,
//   Building2,
// } from "lucide-react";

// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../features/Auth/LoginSlice";


// const Dashboard = () => {
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Selection states
//   const [selectedPage, setSelectedPage] = useState(null);
//   const [selectedRccPage, setSelectedRccPage] = useState(null);
//   const [selectedVrnPage, setSelectedVrnPage] = useState(null);
//   const [selectedDimensionPage, setSelectedDimensionPage] = useState(null);

//   // Dropdown states
//   const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
//   const [isRccDropdownOpen, setIsRccDropdownOpen] = useState(false);
//   const [isVrnDropdownOpen, setIsVrnDropdownOpen] = useState(false);
//   const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false);

//   const { userType, token } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const sidebarRef = useRef(null);

//   useEffect(() => {
//     if (!token) {
//       navigate("/");
//     }
//   }, [token, navigate]);

//   // Active page detection
//   useEffect(() => {
//     const currentPayment = paymentPages.find((p) => p.path === location.pathname);
//     const currentRcc = rccOfficePages.find((p) => p.path === location.pathname);
//     const currentVrn = vrnOfficePages.find((p) => p.path === location.pathname);
//     const currentDimension = dimensionOfficePages.find((p) => p.path === location.pathname);

//     if (currentPayment) {
//       setSelectedPage(currentPayment.id);
//       setSelectedRccPage(null);
//       setSelectedVrnPage(null);
//       setSelectedDimensionPage(null);
//     } else if (currentRcc) {
//       setSelectedRccPage(currentRcc.id);
//       setSelectedPage(null);
//       setSelectedVrnPage(null);
//       setSelectedDimensionPage(null);
//     } else if (currentVrn) {
//       setSelectedVrnPage(currentVrn.id);
//       setSelectedPage(null);
//       setSelectedRccPage(null);
//       setSelectedDimensionPage(null);
//     } else if (currentDimension) {
//       setSelectedDimensionPage(currentDimension.id);
//       setSelectedPage(null);
//       setSelectedRccPage(null);
//       setSelectedVrnPage(null);
//     } else {
//       setSelectedPage(null);
//       setSelectedRccPage(null);
//       setSelectedVrnPage(null);
//       setSelectedDimensionPage(null);
//     }
//   }, [location.pathname]);

//   // ============== ALL PAGES DEFINITION ==============
 

//   const paymentPages = [
//     { id: "Reconciliation", name: "Reconciliation", path: "/dashboard/Reconciliation", allowedUserTypes: ["admin", "Payment"] },
//     { id: "Form", name: "Forms", path: "/dashboard/Form", allowedUserTypes: ["admin", "Payment"] },
//     { id: "Actual_Payment_in", name: "Actual Payment In", path: "/dashboard/Actual_Payment_in", allowedUserTypes: ["admin", "Payment"] },
//     { id: "Transfer_bank_To_bank", name: "Transfer Bank to Bank", path: "/dashboard/Transfer_bank_To_bank", allowedUserTypes: ["admin", "Payment"] },
//   ];

//   const rccOfficePages = [
//     { id: "RCC_Approvel", name: "RCC Approval", path: "/dashboard/RCC_Approvel", allowedUserTypes: ["admin", "RCC"] },
//     { id: "Approvel_By_Mayaksir", name: "Approval By Mayaksir", path: "/dashboard/Approvel_By_Mayaksir", allowedUserTypes: ["admin", "RCC"] },
//     { id: "OfficeExpensesPayment", name: "Office Expenses Payment", path: "/dashboard/OfficeExpensesPayment", allowedUserTypes: ["admin","RCC"] },
//   ];

//   const vrnOfficePages = [
//     { id: "VRN_Approvel1", name: "VRN Approval 1", path: "/dashboard/VRN_Approvel1", allowedUserTypes: ["admin", ] },
//     { id: "VRN_Approvel2", name: "VRN Approval 2", path: "/dashboard/VRN_Approvel2", allowedUserTypes: ["admin"] },
//     { id: "VRN_Report", name: "VRN Report", path: "/dashboard/VRN_Report", allowedUserTypes: ["admin", "viewer"] },
//   ];

//   const dimensionOfficePages = [
//     { id: "Dim_Approvel1", name: "Dim Approval 1", path: "/dashboard/Dim_Approvel1", allowedUserTypes: ["admin", "manager"] },
//     { id: "Dim_Approvel2", name: "Dim Approval 2", path: "/dashboard/Dim_Approvel2", allowedUserTypes: ["admin"] },
//     { id: "Dimension_Transfer", name: "Dimension Transfer", path: "/dashboard/Dimension_Transfer", allowedUserTypes: ["admin"] },
//   ];

//   // Filter accessible pages based on current userType
//   const accessiblePaymentPages = paymentPages.filter((p) => p.allowedUserTypes.includes(userType));
//   const accessibleRccPages = rccOfficePages.filter((p) => p.allowedUserTypes.includes(userType));
//   const accessibleVrnPages = vrnOfficePages.filter((p) => p.allowedUserTypes.includes(userType));
//   const accessibleDimensionPages = dimensionOfficePages.filter((p) => p.allowedUserTypes.includes(userType));

//   // Unified select handler
//   const selectPage = (pageId, type) => {
//     let page;
//     if (type === "payment") page = paymentPages.find((p) => p.id === pageId);
//     else if (type === "rcc") page = rccOfficePages.find((p) => p.id === pageId);
//     else if (type === "vrn") page = vrnOfficePages.find((p) => p.id === pageId);
//     else if (type === "dimension") page = dimensionOfficePages.find((p) => p.id === pageId);

//     setSelectedPage(type === "payment" ? pageId : null);
//     setSelectedRccPage(type === "rcc" ? pageId : null);
//     setSelectedVrnPage(type === "vrn" ? pageId : null);
//     setSelectedDimensionPage(type === "dimension" ? pageId : null);

//     // Close all dropdowns
//     setIsPaymentDropdownOpen(false);
//     setIsRccDropdownOpen(false);
//     setIsVrnDropdownOpen(false);
//     setIsDimensionDropdownOpen(false);

//     if (page) {
//       setIsMobileMenuOpen(false);
//       navigate(page.path);
//     }
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//   };

//   // Click outside to collapse sidebar (desktop only)
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (window.innerWidth >= 1024 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsSidebarExpanded(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="flex min-h-screen bg-blue-200">
//       {/* SIDEBAR */}
//       <div
//         ref={sidebarRef}
//         className={`
//           fixed inset-y-0 left-0 z-50 bg-blue-300 shadow-2xl transition-all duration-300
//           ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
//           lg:translate-x-0 ${isSidebarExpanded ? "lg:w-72" : "lg:w-20"}
//         `}
//         onMouseEnter={() => setIsSidebarExpanded(true)}
//       >
//         <div className="flex flex-col h-full">
//           {/* Logo */}
//           <div className={`flex items-center p-6 border-b border-white/10 ${isSidebarExpanded ? "justify-between" : "lg:justify-center"}`}>
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center">
//                 <img src="/rcc-logo.png" alt="RCC Logo" className="w-10 h-10 object-contain" />
//               </div>
//               <h1 className={`text-xl font-bold text-black transition-all ${isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
//                 RCC Payment
//               </h1>
//             </div>
//             <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-white">
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4 overflow-y-auto">
//             <ul className="space-y-2">
//               {/* Payment Section - Only if user has access to at least one page */}
//               {accessiblePaymentPages.length > 0 && (
//                 <li>
//                   <button
//                     onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-black text-sm font-medium ${
//                       isPaymentDropdownOpen || selectedPage
//                         ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md text-white"
//                         : "hover:bg-white/20"
//                     } ${!isSidebarExpanded ? "lg:justify-center" : ""}`}
//                   >
//                     <DollarSign className="w-5 h-5 flex-shrink-0" />
//                     <span className={`transition-all ${isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
//                       Payment
//                     </span>
//                     {isSidebarExpanded && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""}`} />}
//                   </button>

//                   {isSidebarExpanded && isPaymentDropdownOpen && (
//                     <ul className="ml-6 mt-2 space-y-1 bg-white/10 rounded-lg p-2 border border-white/10">
//                       {accessiblePaymentPages.map((page) => (
//                         <li key={page.id}>
//                           <button
//                             onClick={() => selectPage(page.id, "payment")}
//                             className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
//                               selectedPage === page.id
//                                 ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow"
//                                 : "text-gray-800 hover:bg-white/20"
//                             }`}
//                           >
//                             {page.name}
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               )}

//               {/* RCC OFFICE Section */}
//               {accessibleRccPages.length > 0 && (
//                 <li>
//                   <button
//                     onClick={() => setIsRccDropdownOpen(!isRccDropdownOpen)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-black text-sm font-medium ${
//                       isRccDropdownOpen || selectedRccPage
//                         ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md text-white"
//                         : "hover:bg-white/20"
//                     } ${!isSidebarExpanded ? "lg:justify-center" : ""}`}
//                   >
//                     <Building2 className="w-5 h-5 flex-shrink-0" />
//                     <span className={`transition-all ${isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
//                       RCC OFFICE
//                     </span>
//                     {isSidebarExpanded && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isRccDropdownOpen ? "rotate-180" : ""}`} />}
//                   </button>

//                   {isSidebarExpanded && isRccDropdownOpen && (
//                     <ul className="ml-6 mt-2 space-y-1 bg-white/10 rounded-lg p-2 border border-white/10">
//                       {accessibleRccPages.map((page) => (
//                         <li key={page.id}>
//                           <button
//                             onClick={() => selectPage(page.id, "rcc")}
//                             className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
//                               selectedRccPage === page.id
//                                 ? "bg-purple-500 text-white font-medium shadow"
//                                 : "text-gray-800 hover:bg-white/20"
//                             }`}
//                           >
//                             {page.name}
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               )}

//               {/* VRN Office Section */}
//               {accessibleVrnPages.length > 0 && (
//                 <li>
//                   <button
//                     onClick={() => setIsVrnDropdownOpen(!isVrnDropdownOpen)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-black text-sm font-medium ${
//                       isVrnDropdownOpen || selectedVrnPage
//                         ? "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md text-white"
//                         : "hover:bg-white/20"
//                     } ${!isSidebarExpanded ? "lg:justify-center" : ""}`}
//                   >
//                     <Building2 className="w-5 h-5 flex-shrink-0" />
//                     <span className={`transition-all ${isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
//                       VRN Office
//                     </span>
//                     {isSidebarExpanded && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isVrnDropdownOpen ? "rotate-180" : ""}`} />}
//                   </button>

//                   {isSidebarExpanded && isVrnDropdownOpen && (
//                     <ul className="ml-6 mt-2 space-y-1 bg-white/10 rounded-lg p-2 border border-white/10">
//                       {accessibleVrnPages.map((page) => (
//                         <li key={page.id}>
//                           <button
//                             onClick={() => selectPage(page.id, "vrn")}
//                             className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
//                               selectedVrnPage === page.id
//                                 ? "bg-indigo-500 text-white font-medium shadow"
//                                 : "text-gray-800 hover:bg-white/20"
//                             }`}
//                           >
//                             {page.name}
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               )}

//               {/* Dimension Office Section */}
//               {accessibleDimensionPages.length > 0 && (
//                 <li>
//                   <button
//                     onClick={() => setIsDimensionDropdownOpen(!isDimensionDropdownOpen)}
//                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-black text-sm font-medium ${
//                       isDimensionDropdownOpen || selectedDimensionPage
//                         ? "bg-gradient-to-r from-pink-600 to-rose-600 shadow-md text-white"
//                         : "hover:bg-white/20"
//                     } ${!isSidebarExpanded ? "lg:justify-center" : ""}`}
//                   >
//                     <Building2 className="w-5 h-5 flex-shrink-0" />
//                     <span className={`transition-all ${isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
//                       Dimension Office
//                     </span>
//                     {isSidebarExpanded && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isDimensionDropdownOpen ? "rotate-180" : ""}`} />}
//                   </button>

//                   {isSidebarExpanded && isDimensionDropdownOpen && (
//                     <ul className="ml-6 mt-2 space-y-1 bg-white/10 rounded-lg p-2 border border-white/10">
//                       {accessibleDimensionPages.map((page) => (
//                         <li key={page.id}>
//                           <button
//                             onClick={() => selectPage(page.id, "dimension")}
//                             className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
//                               selectedDimensionPage === page.id
//                                 ? "bg-pink-500 text-white font-medium shadow"
//                                 : "text-gray-800 hover:bg-white/20"
//                             }`}
//                           >
//                             {page.name}
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               )}
//             </ul>
//           </nav>

//           {/* User Info & Logout */}
//           <div className="p-4 border-t border-white/10">
//             <div className={`flex items-center mb-4 ${isSidebarExpanded ? "space-x-3" : "lg:justify-center"}`}>
//               <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div className={isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}>
//                 <p className="text-black font-semibold">{userType || "User"}</p>
//                 <p className="text-gray-700 text-sm">Authorized User</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className={`w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-blue-600 transition-all ${isSidebarExpanded ? "space-x-3" : "lg:justify-center"}`}
//             >
//               <LogOut className="w-5 h-5" />
//               <span className={isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}>
//                 Logout
//               </span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col lg:ml-20">
//         <div className="lg:hidden p-4">
//           <button onClick={() => setIsMobileMenuOpen(true)} className="p-3 rounded-xl bg-white shadow-lg hover:bg-gray-100 transition">
//             <Menu className="w-6 h-6 text-gray-700" />
//           </button>
//         </div>

//         <main className="flex-1 p-4 lg:p-8 overflow-auto">
//           <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 min-h-full border border-gray-100">
//             {(selectedPage || selectedRccPage || selectedVrnPage || selectedDimensionPage) ? (
//               <Outlet />
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full text-center">
//                 <DollarSign className="w-20 h-20 text-emerald-500 mb-6 opacity-20" />
//                 <h3 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to RCC Dashboard</h3>
//                 <p className="text-gray-500 max-w-md">
//                   Please select a page from the sidebar menu to get started.
//                 </p>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
//       )}
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from "react";
import { BarChart3, DollarSign, LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/Auth/LoginSlice";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSummarySelected, setIsSummarySelected] = useState(false);
  const [isPaymentSelected, setIsPaymentSelected] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
    // Default redirect to summary if on root dashboard
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      navigate("/dashboard/summary", { replace: true });
    }
  }, [token, navigate, location.pathname]);

  useEffect(() => {
    const path = location.pathname;

    setIsSummarySelected(path === "/dashboard/summary");
    setIsPaymentSelected(
      path.startsWith("/dashboard/SchedulePayment") ||
      path.startsWith("/dashboard/Form") ||
      path.startsWith("/dashboard/Actual_Payment_in") ||
      path.startsWith("/dashboard/Transfer_bank_To_bank")
    );
  }, [location.pathname]);

  const goToSummary = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard/summary");
  };

  const goToPayment = () => {
    setIsMobileMenuOpen(false);
    // Default payment page — change this according to your need
    navigate("/dashboard/SchedulePayment");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen  bg-gray-400 ">
      {/* NAVBAR */}
      <nav className="bg-gray-700 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Office Payments</h1>
            </div>

            {/* Desktop Menu - Only 2 items */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={goToSummary}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSummarySelected
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <BarChart3 size={18} />
                Summary
              </button>

              <button
                onClick={goToPayment}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isPaymentSelected
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <DollarSign size={18} />
                Payment
              </button>
            </div>

            {/* Logout - Desktop */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-gray-900 shadow-2xl z-50 lg:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              <div className="flex-1 p-5 space-y-4">
                <button
                  onClick={goToSummary}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
                    isSummarySelected
                      ? "bg-amber-600/25 text-amber-400 border-l-4 border-amber-500"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <BarChart3 size={22} />
                  <span className="font-medium">Summary</span>
                </button>

                <button
                  onClick={goToPayment}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
                    isPaymentSelected
                      ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <DollarSign size={22} />
                  <span className="font-medium">Payment</span>
                </button>
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-xl p-6 lg:p-8 min-h-[calc(100vh-8rem)] ">
          {isSummarySelected || isPaymentSelected ? (
            <Outlet />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <DollarSign className="w-24 h-24 text-emerald-600 mb-8 opacity-70" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Welcome to Dashboard
              </h3>
              <p className="text-gray-400 text-lg max-w-md">
                Select Summary or Payment from the menu to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;