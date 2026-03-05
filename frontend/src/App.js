import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import DashboardPage from "./pages/DashboardPage";
import TrackerPage from "./pages/TrackerPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import GoalsPage from "./pages/GoalsPage";
import ParticleBackground from "./components/ParticleBackground";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function App() {
  return (
    <Router>
      <ParticleBackground />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Core Pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracker" element={<TrackerPage />} />
        <Route path="/goals" element={<GoalsPage />} />

        {/* Analytics & Profile */}
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
