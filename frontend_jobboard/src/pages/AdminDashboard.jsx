import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Admin.css'; // We will create this next

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
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [viewingJobId, setViewingJobId] = useState(null);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('jobs'); // 'jobs' or 'users'
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_description: '',
    job_description: '',
    location: '',
  });

  // Fetch all jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      const response = await api.get('/jobs');
      setJobs(response.data);
    };
    
    const fetchUsers = async () => {
      const response = await api.get('/users');
      setUsers(response.data);
    };
    
    if (user && user.role === 'admin') {
      fetchJobs();
      fetchUsers();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/jobs', formData);
      setJobs([{ ...formData, id: response.data.id }, ...jobs]); // Add new job to the top of the list
      setFormData({ title: '', company_name: '', company_description: '', job_description: '', location: '' }); // Clear form
      alert('Job created successfully!');
    } catch (error) {
      alert('Failed to create job.', error);
    }
  };

  const handleViewApplications = async (jobId) => {
    if (viewingJobId === jobId) {
      // If clicking the same button, hide applications
      setViewingJobId(null);
      setApplications([]);
    } else {
      try {
        const response = await api.get(`/jobs/${jobId}/applications`);
        setApplications(response.data);
        setViewingJobId(jobId);
      } catch (error) {
        alert('Failed to fetch applications.', error);
      }
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/jobs/applications/${appId}`, { status: newStatus });
      // Refresh applications for the current job to show the change
      handleViewApplications(viewingJobId); 
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('Failed to update status.');
    }
  };

  const handlePromoteUser = async (userId) => {
    if (window.confirm('Are you sure you want to promote this user to an admin?')) {
      try {
        await api.put(`/users/${userId}/promote`);
        // Refresh user list
        const response = await api.get('/users');
        setUsers(response.data);
        alert('User promoted successfully!');
      } catch (error) {
        console.error('Failed to promote user:', error);
        alert('Failed to promote user.');
      }
    }
  };

  const handleArchiveJob = async (jobId) => {
    if (window.confirm('Are you sure you want to archive this job?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        // Refetch all admin jobs to update the list
        const response = await api.get('/jobs/admin/all');
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to archive job:', error);
        alert('Failed to archive job.');
      }
    }
  };
  
  // Render nothing if user is not an admin (redirect is happening)
  if (!user || user.role !== 'admin') {
      return null;
  }

  // Backend URL for forming full paths to uploaded files
  const backendUrl = 'http://localhost:3001';

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-nav">
        <button onClick={() => setView('jobs')} className={view === 'jobs' ? 'active' : ''}>Manage Jobs</button>
        <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>Manage Users</button>
      </div>

      {view === 'jobs' && (
        <>
          {/* Create Job Form */}
          <section className="admin-section">
            <h2>Create New Job Posting</h2>
            <form onSubmit={handleCreateJob} className="create-job-form">
              <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title" required />
              <input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Company Name" required />
              <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" required />
              <textarea name="company_description" value={formData.company_description} onChange={handleInputChange} placeholder="Company Description" required />
              <textarea name="job_description" value={formData.job_description} onChange={handleInputChange} placeholder="Job Description" rows="5" required />
              <button type="submit">Post Job</button>
            </form>
          </section>

          {/* Manage Jobs and View Applications */}
          <section className="admin-section">
            <h2>Manage Job Postings</h2>
            <div className="job-management-list">
              {jobs.map(job => (
                <div key={job.id} className={`job-manage-card ${job.is_archived ? 'archived' : ''}`}>
                  <div className="job-manage-header">
                    <h3>{job.title} {job.is_archived && '(Archived)'}</h3>
                    <div>
                      <button className="edit-btn">Edit</button> {/* Edit functionality would open a modal/form */}
                      {!job.is_archived && <button className="archive-btn" onClick={() => handleArchiveJob(job.id)}>Archive</button>}
                    </div>
                  </div>
                  <button onClick={() => handleViewApplications(job.id)}>
                    {viewingJobId === job.id ? 'Hide Applications' : 'View Applications'}
                  </button>

                  {viewingJobId === job.id && (
                    <div className="application-list">
                      <h4>Applications for {job.title}</h4>
                      {applications.length > 0 ? (
                        applications.map(app => (
                          <div key={app.id} className="application-card">
                            <p><strong>Applicant:</strong> {app.username}</p>
                            {/* Application Status Management */}
                            <div>
                              <strong>Status: </strong>
                              <select value={app.status} onChange={(e) => handleUpdateStatus(app.id, e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                            <p>
                              <strong>CV:</strong> 
                              <a href={`${backendUrl}/${app.cv_url}`} target="_blank" rel="noopener noreferrer">
                                View PDF
                              </a>
                            </p>
                            <p><strong>Cover Letter:</strong> {app.cover_letter}</p>
                          </div>
                        ))
                      ) : <p>No applications yet.</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'users' && (
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
                      <button onClick={() => handlePromoteUser(u.id)}>
                        Promote to Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;