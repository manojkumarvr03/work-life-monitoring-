import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import DashboardPage from "./pages/DashboardPage";
import TrackerPage from "./pages/TrackerPage";
import ReportsPage from "./pages/ReportsPage";
import InsightsPage from "./pages/InsightsPage";
import ProfilePage from "./pages/ProfilePage";

import SchedulePage from "./pages/SchedulePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetail from "./pages/AdminUserDetail";
import ParticleBackground from "./components/ParticleBackground";
import ChatAssistant from "./components/ChatAssistant/ChatAssistant";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { useEffect, useState } from "react";
import API from "./services/api";

function App() {
  const isAuth = !!localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  
  useEffect(() => {
    if (isAuth) {
      API.get("/api/auth/profile")
        .then(res => {
          const role = (res.data?.user?.role || res.data?.role || "").toLowerCase();
          setUserRole(role);
          if (role === "admin" && !location.pathname.startsWith("/admin")) {
            navigate("/admin");
          }
        })
        .catch(() => {});
    }
  }, [isAuth, location.pathname, navigate]);

  // Hide Chatbot on admin routes
  const hideChatbot = location.pathname.startsWith('/admin') || userRole === "admin";

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <>
        <ParticleBackground />
        {isAuth && !hideChatbot && <ChatAssistant />}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Core Pages - Protected from Admin */}
          <Route path="/dashboard" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <DashboardPage />} />
          <Route path="/tracker" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <TrackerPage />} />
          <Route path="/schedule" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <SchedulePage />} />

          {/* Analytics & Profile - Protected from Admin */}
          <Route path="/insights" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <InsightsPage />} />
          <Route path="/reports" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <ReportsPage />} />
          <Route path="/profile" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <ProfilePage />} />
          
          {/* Admin Page */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/user/:id" element={<AdminUserDetail />} />
          
          {/* Catch-all redirect to login for any unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;
