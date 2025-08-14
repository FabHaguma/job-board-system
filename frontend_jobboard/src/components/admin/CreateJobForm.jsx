import { useState } from 'react';
import api from '../../services/api';
import NotificationModal from '../NotificationModal';
import './CreateJobForm.css';

const CreateJobForm = ({ onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_description: '',
    job_description: '',
    location: '',
    salary: '',
    requirements: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const closeNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (!formData.company_description.trim()) {
      newErrors.company_description = 'Company description is required';
    }
    
    if (!formData.job_description.trim()) {
      newErrors.job_description = 'Job description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/jobs', formData);
      
      // Clear form after successful creation
      setFormData({
        title: '',
        company_name: '',
        company_description: '',
        job_description: '',
        location: '',
        salary: '',
        requirements: '',
        tags: '',
      });
      
      // Call the callback to notify parent component
      if (onJobCreated) {
        onJobCreated({ ...formData, id: response.data.id });
      }
      
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'Job created successfully!'
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to create job. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-job-form-container">
      <form onSubmit={handleCreateJob} className="create-job-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Job Title"
            className={errors.title ? 'error' : ''}
            required
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            placeholder="Company Name"
            className={errors.company_name ? 'error' : ''}
            required
          />
          {errors.company_name && <span className="error-message">{errors.company_name}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location"
            className={errors.location ? 'error' : ''}
            required
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            placeholder="Salary (e.g., Rwf350,000 - Rwf600,000)"
          />
        </div>

        <div className="form-group">
          <textarea
            name="company_description"
            value={formData.company_description}
            onChange={handleInputChange}
            placeholder="Company Description"
            rows="3"
            className={errors.company_description ? 'error' : ''}
            required
          />
          {errors.company_description && <span className="error-message">{errors.company_description}</span>}
        </div>

        <div className="form-group">
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleInputChange}
            placeholder="Job Description"
            rows="5"
            className={errors.job_description ? 'error' : ''}
            required
          />
          {errors.job_description && <span className="error-message">{errors.job_description}</span>}
        </div>

        <div className="form-group">
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            placeholder="Job Requirements (e.g., Bachelor's degree, 2+ years experience, etc.)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Tags (comma-separated, e.g., React, JavaScript, Remote)"
          />
        </div>

        <button 
          type="submit" 
          className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Job...' : 'Post Job'}
        </button>
      </form>
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default CreateJobForm;
