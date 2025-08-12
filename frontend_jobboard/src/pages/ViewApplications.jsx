import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './Admin.css';

const ViewApplications = () => {
  // Authentication check
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { jobId } = useParams();
  
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // State for the component
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch job details and applications
  useEffect(() => {
    const fetchData = async () => {
      if (!jobId || !user || user.role !== 'admin') return;
      
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await api.get(`/jobs/${jobId}`);
        setJob(jobResponse.data);
        
        // Fetch applications for this job
        const appsResponse = await api.get(`/jobs/${jobId}/applications`);
        setApplications(appsResponse.data);
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Failed to load job applications.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [jobId, user]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/applications/${appId}`, { status: newStatus });
      
      // Refresh applications to show the change
      const response = await api.get(`/jobs/${jobId}/applications`);
      setApplications(response.data);
      
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update status.');
    }
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

  if (!job) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <button onClick={() => navigate('/admin/manage-jobs')} className="back-btn">← Back to Manage Jobs</button>
          <h1>Job Not Found</h1>
        </div>
        <p>The requested job could not be found.</p>
      </div>
    );
  }

  // Base URL for forming full paths to uploaded files (Option A)
  // Prefer explicit VITE_FILES_BASE; else derive from VITE_API_URL by stripping trailing '/api';
  // finally fallback to current origin.
  const rawApiBase = import.meta.env.VITE_API_URL || '';
  const filesBase = (
    import.meta.env.VITE_FILES_BASE
    || (rawApiBase ? rawApiBase.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : ''))
  ).replace(/\/+$/, '');

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button onClick={() => navigate('/admin/manage-jobs')} className="back-btn">← Back to Manage Jobs</button>
        <h1>Applications for: {job.title}</h1>
      </div>

      {/* Job Details Section */}
      <section className="admin-section">
        <h2>Job Details</h2>
        <div className="job-details-card">
          <h3>{job.title}</h3>
          <p><strong>Company:</strong> {job.company_name}</p>
          <p><strong>Location:</strong> {job.location}</p>
          {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
          <p><strong>Description:</strong> {job.job_description}</p>
          {job.requirements && <p><strong>Requirements:</strong> {job.requirements}</p>}
          {job.tags && <p><strong>Tags:</strong> {job.tags}</p>}
        </div>
      </section>

      {/* Applications Section */}
      <section className="admin-section">
        <h2>Applications ({applications.length})</h2>
        
        {applications.length > 0 ? (
          <div className="applications-grid">
            {applications.map(app => (
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
                    <strong>Applied on:</strong> {new Date(app.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="application-field">
                    <strong>CV:</strong>
                    <a 
                      href={`${filesBase}/${String(app.cv_url).replace(/^\/+/, '')}`} 
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
              </div>
            ))}
          </div>
        ) : (
          <div className="no-applications">
            <p>No applications have been submitted for this job yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ViewApplications;
