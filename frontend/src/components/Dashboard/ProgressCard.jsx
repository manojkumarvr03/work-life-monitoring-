// DashboardPage.jsx
import Sidebar from "../components/Sidebar/Sidebar";
import Dashboard from "../components/Dashboard/Dashboard";
import "../styles/dashboard.css";

const DashboardPage = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Dashboard />
      </main>
    </div>
  );
};

export default DashboardPage;
