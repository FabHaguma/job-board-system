import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import NotificationModal from '../components/NotificationModal';
import './Admin.css';

const AdminDashboard = () => {
  // Authentication check
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // State for the component
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0
  });

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  // Fetch users and stats on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
        setStats(prev => ({ ...prev, totalUsers: response.data.length }));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    const fetchStats = async () => {
      try {
        const jobsResponse = await api.get('/jobs/admin/all');
        const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
        setStats(prev => ({ ...prev, totalJobs: jobs.length }));
        
        // Fetch total applications count
        const applicationsResponse = await api.get('/jobs/admin/all-applications');
        const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
        setStats(prev => ({ ...prev, totalApplications: applications.length }));
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [user]);

  const handlePromoteUserClick = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setShowConfirmModal(true);
  };

  const handleConfirmPromotion = async () => {
    try {
      await api.put(`/users/${selectedUserId}/promote`);
      // Refresh user list
      const response = await api.get('/users');
      setUsers(response.data);
      setStats(prev => ({ ...prev, totalUsers: response.data.length }));
      
      setShowConfirmModal(false);
      showNotification(
        'Success',
        `${selectedUsername} has been promoted to admin successfully!`,
        'success'
      );
    } catch (error) {
      console.error('Failed to promote user:', error);
      setShowConfirmModal(false);
      showNotification(
        'Error',
        'Failed to promote user. Please try again.',
        'error'
      );
    }
  };

  const showNotification = (title, message, type = 'info') => {
    setNotification({ title, message, type });
    setShowNotificationModal(true);
  };
  
  // Render nothing if user is not an admin (redirect is happening)
  if (!user || user.role !== 'admin') {
      return null;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <section className="admin-section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="admin-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/admin/manage-jobs')}
          >
            📝 Manage Job Postings
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => navigate('/admin/all-applications')}
          >
            👁️ View All Applications
          </button>
        </div>
      </section>

      {/* User Management */}
      <section className="admin-section">
        <h2>User Management</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === 'user' && (
                    <button onClick={() => handlePromoteUserClick(u.id, u.username)}>
                      Promote to Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPromotion}
        title="Confirm User Promotion"
        message={`Are you sure you want to promote "${selectedUsername}" to admin? This action will give them administrative privileges.`}
        confirmText="Promote to Admin"
        cancelText="Cancel"
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default AdminDashboard;