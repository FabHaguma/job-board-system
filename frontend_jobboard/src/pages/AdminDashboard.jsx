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
  const [formData, setFormData] = useState({
    title: '',
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
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/jobs', formData);
      setJobs([{ ...formData, id: response.data.id }, ...jobs]); // Add new job to the top of the list
      setFormData({ title: '', company_description: '', job_description: '', location: '' }); // Clear form
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
  
  // Render nothing if user is not an admin (redirect is happening)
  if (!user || user.role !== 'admin') {
      return null;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Create Job Form */}
      <section className="admin-section">
        <h2>Create New Job Posting</h2>
        <form onSubmit={handleCreateJob} className="create-job-form">
          <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title" required />
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
            <div key={job.id} className="job-manage-card">
              <h3>{job.title}</h3>
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
                        <p><strong>CV:</strong> <a href={app.cv_url} target="_blank" rel="noopener noreferrer">Link</a></p>
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
    </div>
  );
};

export default AdminDashboard;