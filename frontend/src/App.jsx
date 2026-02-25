// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

import Summary from "./components/paymentSummary/Summary";
import SchedulePayment from "./components/Payment/SchedulePayment";
// import Leads from "./components/LeadsSummary/Leads";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard with Nested Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="summary" element={<Summary />} />
          <Route path="SchedulePayment" element={<SchedulePayment />} />

          {/* <Route path="Leads" element={<Leads />} /> */}
        </Route>

        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
