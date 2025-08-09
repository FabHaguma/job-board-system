import { useState } from 'react';

export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (let rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (submitFunction) => {
    setIsSubmitting(true);
    
    if (validateAll()) {
      try {
        await submitFunction(values);
      } catch (error) {
        console.error('Submit error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset
  };
};

// Common validation rules
export const validationRules = {
  required: (value) => !value?.trim() ? 'This field is required' : '',
  
  minLength: (min) => (value) => 
    value?.length < min ? `Must be at least ${min} characters` : '',
  
  maxLength: (max) => (value) => 
    value?.length > max ? `Must not exceed ${max} characters` : '',
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Please enter a valid email' : '';
  },
  
  username: (value) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return value && !usernameRegex.test(value) 
      ? 'Username can only contain letters, numbers, and underscores' 
      : '';
  },
  
  strongPassword: (value) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    return value && !passwordRegex.test(value) 
      ? 'Password must contain at least one lowercase letter, one uppercase letter, and one number' 
      : '';
  },
  
  confirmPassword: (confirmValue, values) => 
    confirmValue !== values.password ? 'Passwords do not match' : ''
};
