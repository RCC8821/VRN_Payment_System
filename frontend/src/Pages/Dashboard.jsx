import React, { useState, useEffect } from "react";
import { BarChart3, DollarSign, LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/Auth/LoginSlice";

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSummarySelected, setIsSummarySelected] = useState(false);
  const [isPaymentSelected, setIsPaymentSelected] = useState(false);
  const [isLeadsSelected, setIsLeadsSelected] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    // Redirect /dashboard → /dashboard/summary
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      navigate("/dashboard/summary", { replace: true });
    }
  }, [token, navigate, location.pathname]);

  useEffect(() => {
    const path = location.pathname;

    setIsSummarySelected(path === "/dashboard/summary");

    setIsPaymentSelected(
      path.startsWith("/dashboard/SchedulePayment") ||
      path === "/dashboard/SchedulePayment"
    );

    setIsLeadsSelected(
      path.startsWith("/dashboard/Leads") ||
      path === "/dashboard/Leads"
    );
  }, [location.pathname]);

  const goToSummary = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard/summary");
  };

  const goToPayment = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard/SchedulePayment");
  };

  const goToLeads = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard/Leads");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-[#1A3263] overflow-x-hidden">
      {/* NAVBAR - STICKY */}
      <nav
        className="bg-[#1A3263] border-b border-gray-800 fixed top-0 left-0 right-0 z-50"
        style={{
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          height: "64px",
        }}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                VRN Office
              </h1>
            </div>

            {/* Desktop Menu */}
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

              <button
                onClick={goToLeads}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLeadsSelected
                    ? "bg-blue-400 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                Leads
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

                <button
                  onClick={goToLeads}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-lg transition-all ${
                    isLeadsSelected
                      ? "bg-emerald-600/25 text-emerald-400 border-l-4 border-emerald-500"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span className="font-medium">Leads</span>
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

      {/* Main Content */}
      <main className="w-full pt-16 px-3 sm:px-4 lg:px-5 pb-4">
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)] w-full">
          {isSummarySelected || isPaymentSelected || isLeadsSelected ? (
            <Outlet />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 sm:py-20">
              <DollarSign className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-600 mb-6 sm:mb-8 opacity-70" />
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Welcome to Dashboard
              </h3>
              <p className="text-gray-600 text-base sm:text-lg max-w-md">
                Select Summary, Payment or Leads from the menu to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;