import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/admin.css';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAndPerformance = async () => {
      try {
        setLoading(true);
        // We need user details to show name/email
        const usersRes = await API.get('/api/admin/users');
        const foundUser = usersRes.data.find(u => u._id === id);
        
        if (!foundUser) {
          setError('User not found');
          return;
        }
        
        setUser(foundUser);
        
        const perfRes = await API.get(`/api/admin/users/${id}/performance`);
        setPerformance(perfRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPerformance();
  }, [id]);

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="admin-main loading-container">
        <div className="modal-loading">Analyzing User Performance Data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="app-shell">
      <Sidebar />
      <div className="admin-main error-container">
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={() => navigate('/admin')} className="btn-primary">Back to Panel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar />
      <motion.main 
        className="admin-main"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
             <button onClick={() => navigate('/admin')} className="back-link">
                &larr; Back to Admin Panel
             </button>
          </div>
          <div className="user-detail-header">
            <div className="user-profile-info">
                <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                    alt="" 
                    className="detail-avatar"
                />
                <div>
                    <h1 className="shimmer-text">{user?.name}</h1>
                    <p>{user?.email} • <span className={`role-tag ${user?.role.toLowerCase()}`}>{user?.role}</span></p>
                </div>
            </div>
          </div>
        </header>

        {performance && (
          <div className="detail-content">
            <motion.div 
                className="perf-stats-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
              <div className="p-stat-card">
                <span className="p-label">Work-Life Balance Score</span>
                <div className="p-value-group">
                  <span className="p-main-value">{performance.score}%</span>
                  <span className={`p-badge ${performance.label.toLowerCase()}`}>{performance.label}</span>
                </div>
              </div>
              <div className="p-stat-card">
                <span className="p-label">Total Activity Logs</span>
                <span className="p-value">{performance.totalLogs}</span>
              </div>
              <div className="p-stat-card">
                <span className="p-label">Avg. Study/Work Hours</span>
                <span className="p-value">{performance.avgStudyHours}h</span>
              </div>
            </motion.div>

            <div className="detail-grid">
              <motion.section 
                className="perf-section glass-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4>Performance Split</h4>
                <div className="split-progress-container">
                  <div className="split-item">
                    <div className="split-header"><span>Academic/Work Performance</span> <span>{performance.workScore}%</span></div>
                    <div className="split-bar"><div className="split-fill" style={{ width: `${performance.workScore}%`, background: 'var(--accent-blue-start)' }}></div></div>
                  </div>
                  <div className="split-item">
                    <div className="split-header"><span>Health & Well-being</span> <span>{performance.lifeScore}%</span></div>
                    <div className="split-bar"><div className="split-fill" style={{ width: `${performance.lifeScore}%`, background: 'var(--accent-secondary)' }}></div></div>
                  </div>
                </div>
                <div className="perf-insight">
                    <p>Based on the last {performance.recentActivities.length} logs, this user maintains an <strong>{performance.label}</strong> balance across their academic and personal activities.</p>
                </div>
              </motion.section>

              <motion.section 
                className="perf-section glass-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4>Detailed Activity Logs</h4>
                <div className="detailed-logs-list">
                  {performance.recentActivities.length > 0 ? (
                    performance.recentActivities.map((act, idx) => (
                      <div key={idx} className="detail-log-item">
                        <div className="log-main">
                            <span className="l-date">{new Date(act.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                            <span className="l-type">{act.activityType}</span>
                        </div>
                        <div className="log-metrics">
                            <span className="l-hours"><strong>{Number(act.studyHours || 0) + Number(act.workHours || 0)}h</strong> Study</span>
                            <span className="l-sleep"><strong>{act.sleepHours}h</strong> Sleep</span>
                            <span className="l-stress">Stress: <strong>{act.stressLevel}/10</strong></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No activities logged for this period.</p>
                  )}
                </div>
              </motion.section>
            </div>
          </div>
        )}
      </motion.main>
    </div>
  );
};

export default AdminUserDetail;
