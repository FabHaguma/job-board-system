import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreateJobForm from '../components/admin';
import './Admin.css';

const ManageJobs = () => {
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
  const [allJobs, setAllJobs] = useState([]); // Store all jobs for filtering
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', location: '', status: 'all' }); // all, active, archived

  // Fetch all jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Admin needs all jobs (including archived) and this endpoint returns an array
        const response = await api.get('/jobs/admin/all');
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];
        setAllJobs(list);
        setJobs(list); // Initially show all jobs
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setAllJobs([]);
        setJobs([]);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchJobs();
    }
  }, [user]);

  // Filter jobs based on current filters
  useEffect(() => {
    let filtered = [...allJobs];

    // Filter by search term (title or company name)
    if (filters.search) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by status (active/archived)
    if (filters.status === 'active') {
      filtered = filtered.filter(job => !job.is_archived);
    } else if (filters.status === 'archived') {
      filtered = filtered.filter(job => job.is_archived);
    }

    setJobs(filtered);
  }, [allJobs, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleJobCreated = (newJob) => {
    const updatedAllJobs = [newJob, ...allJobs];
    setAllJobs(updatedAllJobs); // Add new job to the top of the list
    setShowCreateModal(false); // Close the modal
  };

  const handleViewApplications = (jobId) => {
    navigate(`/admin/applications/${jobId}`);
  };

  const handleArchiveJob = async (jobId) => {
    if (window.confirm('Are you sure you want to archive this job?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        // Refetch all admin jobs to update the list
        const response = await api.get('/jobs/admin/all');
        const list = Array.isArray(response.data) ? response.data : [];
        setAllJobs(list);
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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back to Dashboard</button>
        <h1>Manage Job Postings</h1>
      </div>

      {/* Create Job Button */}
      <section className="admin-section">
        <div className="create-job-header">
          <h2>Job Postings Management</h2>
          <button 
            className="create-job-btn primary" 
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create New Job
          </button>
        </div>
      </section>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Job Posting</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <CreateJobForm onJobCreated={handleJobCreated} />
            </div>
          </div>
        </div>
      )}

      {/* Manage Jobs */}
      <section className="admin-section">
        <h2>All Job Postings ({jobs.length})</h2>
        
        {/* Filter Section */}
        <div className="job-filters">
          <div className="filter-row">
            <input
              type="text"
              name="search"
              placeholder="Search by title or company..."
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
            />
            <input
              type="text"
              name="location"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={handleFilterChange}
              className="filter-input"
            />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="all">All Jobs ({allJobs.length})</option>
              <option value="active">Active ({allJobs.filter(job => !job.is_archived).length})</option>
              <option value="archived">Archived ({allJobs.filter(job => job.is_archived).length})</option>
            </select>
          </div>
        </div>

        <div className="job-management-list">
          {Array.isArray(jobs) && jobs.length > 0 ? jobs.map(job => (
            <div key={job.id} className={`job-manage-card ${job.is_archived ? 'archived' : ''}`}>
              <div className="job-manage-header">
                <h3>{job.title} {job.is_archived && '(Archived)'}</h3>
                <div>
                  <button className="edit-btn">Edit</button> {/* Edit functionality would open a modal/form */}
                  {!job.is_archived && <button className="archive-btn" onClick={() => handleArchiveJob(job.id)}>Archive</button>}
                </div>
              </div>
              <div className="job-details">
                <p><strong>Company:</strong> {job.company_name}</p>
                <p><strong>Location:</strong> {job.location}</p>
                {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
              </div>
              <div className="job-actions">
                <button 
                  className="view-applications-btn" 
                  onClick={() => handleViewApplications(job.id)}
                >
                  View Applications
                </button>
              </div>
            </div>
          )) : <p>No jobs found.</p>}
        </div>
      </section>
    </div>
  );
};

export default ManageJobs;
