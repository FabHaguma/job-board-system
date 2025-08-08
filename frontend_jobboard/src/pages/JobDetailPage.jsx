import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import ApplyForm from '../features/jobs/ApplyForm';
import './JobDetail.css';

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error('Failed to fetch job details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (!job) return <p>Job not found. <Link to="/">Go back</Link></p>;

  return (
    <div className="job-detail-container">
      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <p className="company-name">{job.company_name}</p>
        <p className="company-info">{job.company_description} - <strong>{job.location}</strong></p>
        <p className="salary-info">Salary: {job.salary || 'Not disclosed'}</p>
      </div>
      <div className="job-detail-body">
        <h3>Job Description</h3>
        <p>{job.job_description}</p>
        
        <h3>Requirements</h3>
        <p>{job.requirements}</p>

        <h3>Tags</h3>
        <div className="tags">
          {job.tags && job.tags.split(',').map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
      <div className="job-detail-footer">
        {user && user.role === 'user' && (
          <button onClick={() => setShowApplyForm(!showApplyForm)}>
            {showApplyForm ? 'Cancel Application' : 'Apply for this Job'}
          </button>
        )}
        {showApplyForm && <ApplyForm jobId={job.id} />}
      </div>
    </div>
  );
};

export default JobDetailPage;