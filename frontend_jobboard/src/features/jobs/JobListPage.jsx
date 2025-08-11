import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import './Job.css';

const JobListPage = () => {
  // Get current user from Redux store
  const { user } = useSelector((state) => state.auth);
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user applications
  const [userApplications, setUserApplications] = useState([]);

  // New state for filtering and pagination
  const [filters, setFilters] = useState({ search: '', location: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: 5, // Show 5 jobs per page
          ...filters
        });
        const response = await api.get(`/jobs?${params.toString()}`);
        setJobs(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError('Failed to fetch jobs.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [filters, currentPage]); // Re-fetch when filters or page changes

  // Fetch user applications when user is logged in
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!user) {
        setUserApplications([]);
        return;
      }
      
      try {
        const response = await api.get('/jobs/user/applications');
        setUserApplications(response.data);
      } catch (err) {
        console.error('Failed to fetch user applications:', err);
        setUserApplications([]);
      }
    };
    
    fetchUserApplications();
  }, [user]); // Re-fetch when user login status changes

  // Helper function to check if user has applied to a job
  const hasUserApplied = (jobId) => {
    return userApplications.some(app => app.job_id === jobId);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Reset to first page on new filter
  };

  return (
    <div>
      <h1>Current Job Openings</h1>
      
      {/* Filter Section */}
      <div className="filter-container">
        <input
          type="text"
          name="search"
          placeholder="Search by title or company..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Filter by location..."
          value={filters.location}
          onChange={handleFilterChange}
        />
      </div>

      {isLoading ? <p>Loading jobs...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <>
          <div className="job-list">
            {jobs.length > 0 ? jobs.map((job) => (
              <div 
                key={job.id} 
                className={`job-card${hasUserApplied(job.id) ? ' applied' : ''}`}
              >
                <Link to={`/jobs/${job.id}`} className="job-link">
                  <h2>{job.title}</h2>
                  <p className="job-company-name">{job.company_name}</p>
                  <p className="job-location">{job.location}</p>
                  <p className="job-company">{job.company_description}</p>
                </Link>
              </div>
            )) : <p>No matching job openings found.</p>}
          </div>

          {/* Pagination Section */}
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobListPage;