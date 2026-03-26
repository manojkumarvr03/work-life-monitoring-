import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes] = await Promise.all([
        API.get('/api/admin/stats'),
        API.get('/api/admin/users')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = (id) => {
    navigate(`/admin/user/${id}`);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/api/admin/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await API.put(`/api/admin/users/${id}/role`, { role: newRole });
      setUsers(users.map(user => user._id === id ? res.data : user));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <div className="admin-loading">Loading Admin Dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;

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
            <div style={{ width: '48px', height: '4px', background: 'var(--gradient-main, linear-gradient(135deg, #0ea5e9, #6366f1))', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Administrative Suite</span>
          </div>
          <h1 className="shimmer-text">Admin Control Panel</h1>
          <p>Monitor system performance and manage your community</p>
        </header>

        <motion.div 
          className="admin-stats-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {[
            { label: 'Total Users', value: stats?.totalUsers },
            { label: 'Total Activities', value: stats?.totalActivities },
            { label: 'Avg. Performance', value: `${stats?.avgStudyHours}h`, sub: 'per user activity' }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              className="stat-card"
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <h3>{stat.label}</h3>
              <p className="stat-value">{stat.value}</p>
              {stat.sub && <span className="stat-label">{stat.sub}</span>}
            </motion.div>
          ))}
        </motion.div>

        <motion.section 
          className="admin-users-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>User Management</h2>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr 
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    className="clickable-row"
                    onClick={() => handleViewPerformance(user._id)}
                  >
                    <td>
                      <div className="user-cell">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
                        <span className="user-info-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        value={user.role} 
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRoleChange(user._id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`role-select ${user.role.toLowerCase()}`}
                      >
                        <option value="Student">Student</option>
                        <option value="Employee">Employee</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                        className="delete-btn"
                        disabled={user.role === 'Admin' && user.email === 'mnojkumarvr@gmail.com'}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
};

export default AdminDashboard;
