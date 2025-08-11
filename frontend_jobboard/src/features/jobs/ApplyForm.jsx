import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import NotificationModal from '../../components/NotificationModal';
import './ApplyForm.css';

const ApplyForm = ({ jobId }) => {
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null); // State for the file object
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter || !cvFile) {
      setNotification({
        title: 'Missing Information',
        message: 'Please provide both a cover letter and a CV file.',
        type: 'error'
      });
      setShowNotification(true);
      return;
    }

    const formData = new FormData();
    formData.append('cover_letter', coverLetter);
    formData.append('cv_file', cvFile);

    try {
      // The content type is automatically set to multipart/form-data by the browser
      await api.post(`/jobs/${jobId}/apply`, formData);
      setNotification({
        title: 'Success!',
        message: 'Application submitted successfully!',
        type: 'success'
      });
      setShowNotification(true);
      // Reset form after successful submission
      setCoverLetter('');
      setCvFile(null);
      // Reset file input
      const fileInput = document.getElementById('cv_file_input');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setNotification({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to submit application.',
        type: 'error'
      });
      setShowNotification(true);
    }
  };

  return (
    <div className="apply-form-container">
      <div className="apply-form-header">
        <h4>Submit Your Application</h4>
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          className="back-to-jobs-btn"
        >
          ← Back to Job Openings
        </button>
      </div>
      <form onSubmit={onSubmit} role="form">
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Your Cover Letter"
          rows="5"
          required
        ></textarea>
        
        {/* Replace text input with file input */}
        <label htmlFor="cv_file_input">Upload CV (PDF only)</label>
        <input
          type="file"
          id="cv_file_input"
          name="cv_file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />
        
        <button type="submit">Submit Application</button>
      </form>
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        autoClose={notification.type === 'success'}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default ApplyForm;