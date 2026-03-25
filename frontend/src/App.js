import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import DashboardPage from "./pages/DashboardPage";
import TrackerPage from "./pages/TrackerPage";
import ReportsPage from "./pages/ReportsPage";
import InsightsPage from "./pages/InsightsPage";
import ProfilePage from "./pages/ProfilePage";

import SchedulePage from "./pages/SchedulePage";
import ParticleBackground from "./components/ParticleBackground";
import ChatAssistant from "./components/ChatAssistant/ChatAssistant";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function App() {
  const isAuth = !!localStorage.getItem("token");

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
      <ParticleBackground />
      {isAuth && <ChatAssistant />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Core Pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracker" element={<TrackerPage />} />

        <Route path="/schedule" element={<SchedulePage />} />


        {/* Analytics & Profile */}
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Catch-all redirect to login for any unknown paths */}
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
