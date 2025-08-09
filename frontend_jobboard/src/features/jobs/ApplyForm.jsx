import { useState } from 'react';
import api from '../../services/api';
import './ApplyForm.css';

const ApplyForm = ({ jobId }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null); // State for the file object
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!coverLetter || !cvFile) {
      setIsError(true);
      setMessage('Please provide both a cover letter and a CV file.');
      return;
    }

    const formData = new FormData();
    formData.append('cover_letter', coverLetter);
    formData.append('cv_file', cvFile);

    try {
      // The content type is automatically set to multipart/form-data by the browser
      await api.post(`/jobs/${jobId}/apply`, formData);
      setIsError(false);
      setMessage('Application submitted successfully!');
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to submit application.');
    }
  };

  return (
    <div className="apply-form-container">
      <h4>Submit Your Application</h4>
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
      {message && (
        <p style={{ color: isError ? 'red' : 'green', marginTop: '10px' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ApplyForm;