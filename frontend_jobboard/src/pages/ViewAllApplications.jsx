import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Admin.css';

const ViewAllApplications = () => {
  // Authentication check
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // State for the component
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, reviewed, accepted, rejected

  // Fetch all applications
  useEffect(() => {
    const fetchAllApplications = async () => {
      if (!user || user.role !== 'admin') return;
      
      try {
        setLoading(true);
        const response = await api.get('/jobs/admin/all-applications');
        setApplications(response.data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        alert('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllApplications();
  }, [user]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/applications/${appId}`, { status: newStatus });
      
      // Update the local state to reflect the change
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === appId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update status.');
    }
  };

  const handleViewJobApplications = (jobId) => {
    navigate(`/admin/applications/${jobId}`);
  };
  
  // Render nothing if user is not an admin (redirect is happening)
  if (!user || user.role !== 'admin') {
      return null;
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Filter applications based on selected filter
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  // Backend URL for forming full paths to uploaded files
  const backendUrl = 'http://localhost:3001';

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back to Dashboard</button>
        <h1>All Applications</h1>
      </div>

      {/* Filter Section */}
      <section className="admin-section">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select 
            id="status-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter-select"
          >
            <option value="all">All Applications ({applications.length})</option>
            <option value="pending">Pending ({applications.filter(app => app.status === 'pending').length})</option>
            <option value="reviewed">Reviewed ({applications.filter(app => app.status === 'reviewed').length})</option>
            <option value="accepted">Accepted ({applications.filter(app => app.status === 'accepted').length})</option>
            <option value="rejected">Rejected ({applications.filter(app => app.status === 'rejected').length})</option>
          </select>
        </div>
      </section>

      {/* Applications Section */}
      <section className="admin-section">
        <h2>Applications ({filteredApplications.length})</h2>
        
        {filteredApplications.length > 0 ? (
          <div className="applications-grid">
            {filteredApplications.map(app => (
              <div key={app.id} className="application-card-detailed">
                <div className="application-header">
                  <h4>{app.username}</h4>
                  <div className="application-status">
                    <label htmlFor={`status-${app.id}`}>Status:</label>
                    <select 
                      id={`status-${app.id}`}
                      value={app.status} 
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className={`status-select status-${app.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="application-content">
                  <div className="application-field">
                    <strong>Job:</strong> 
                    <span 
                      className="job-title-link" 
                      onClick={() => handleViewJobApplications(app.job_id)}
                    >
                      {app.job_title} at {app.company_name}
                    </span>
                  </div>
                  
                  <div className="application-field">
                    <strong>Applied on:</strong> {new Date(app.application_date).toLocaleDateString()}
                  </div>
                  
                  <div className="application-field">
                    <strong>CV:</strong>
                    <a 
                      href={`${backendUrl}/${app.cv_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cv-link"
                    >
                      📄 View CV (PDF)
                    </a>
                  </div>
                  
                  {app.cover_letter && (
                    <div className="application-field">
                      <strong>Cover Letter:</strong>
                      <div className="cover-letter-content">
                        {app.cover_letter}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="application-actions">
                  <button 
                    className="view-job-applications-btn"
                    onClick={() => handleViewJobApplications(app.job_id)}
                  >
                    View All Job Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-applications">
            <p>No applications found for the selected filter.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewAllApplications;
