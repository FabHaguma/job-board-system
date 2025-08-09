import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from './authSlice';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      setApiError(message || 'Login failed. Please try again.');
    }
    if (isSuccess || user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setApiError('');
      await dispatch(login(formData)).unwrap();
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <h3 className="loading-text">
          Loading
          <span className="loading-spinner"></span>
        </h3>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Please log in to your account</p>
        </div>

        {apiError && (
          <div className="error-message" role="alert">
            {apiError}
          </div>
        )}

        <form className="login-form" onSubmit={onSubmit} role="form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${formErrors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {formErrors.username && (
              <span className="error-text">{formErrors.username}</span>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${formErrors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {formErrors.password && (
              <span className="error-text">{formErrors.password}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-link">
          <p>Don&apos;t have an account? <Link to="/register">Create one here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;