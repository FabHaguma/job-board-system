import { useState } from 'react';
import api from '../../services/api';
import './ApplyForm.css'; // We will create this next

const ApplyForm = ({ jobId }) => {
  const [formData, setFormData] = useState({
    cover_letter: '',
    cv_url: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const { cover_letter, cv_url } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!cover_letter || !cv_url) {
      setIsError(true);
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      await api.post(`/jobs/${jobId}/apply`, { cover_letter, cv_url });
      setIsError(false);
      setMessage('Application submitted successfully!');
      // Optionally, disable form or hide it after submission
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to submit application.');
    }
  };

  return (
    <div className="apply-form-container">
      <h4>Submit Your Application</h4>
      <form onSubmit={onSubmit}>
        <textarea
          name="cover_letter"
          value={cover_letter}
          onChange={onChange}
          placeholder="Your Cover Letter"
          rows="5"
          required
        ></textarea>
        <input
          type="text"
          name="cv_url"
          value={cv_url}
          onChange={onChange}
          placeholder="Link to your CV (e.g., LinkedIn, Google Drive)"
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