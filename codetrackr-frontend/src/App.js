import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { UserProvider } from "./utils/UserContext";
import DashboardPage from "./pages/DashboardPage";
import ViaSocketPage from "./pages/ViaSocketPage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/viasocket" element={<DashboardPage><ViaSocketPage /></DashboardPage>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;