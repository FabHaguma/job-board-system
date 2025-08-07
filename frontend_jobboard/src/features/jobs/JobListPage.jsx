import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import ApplyForm from './ApplyForm'; // We will create this next
import './Job.css'; // We will create this css file next

const JobListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingToJobId, setApplyingToJobId] = useState(null);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApplyClick = (jobId) => {
    // Toggle the application form
    setApplyingToJobId(currentId => (currentId === jobId ? null : jobId));
  };

  if (isLoading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Current Job Openings</h1>
      <div className="job-list">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h2>{job.title}</h2>
            <p className="job-location">{job.location}</p>
            <p className="job-company">{job.company_description}</p>
            {/* Show Apply button only to logged-in users */}
            {user && user.role === 'user' && (
              <button onClick={() => handleApplyClick(job.id)}>
                {applyingToJobId === job.id ? 'Cancel' : 'Apply Now'}
              </button>
            )}
            {/* Conditionally render the application form */}
            {applyingToJobId === job.id && <ApplyForm jobId={job.id} />}
          </div>
        )) : <p>No job openings at the moment. Please check back later.</p>}
      </div>
    </div>
  );
};

export default JobListPage;