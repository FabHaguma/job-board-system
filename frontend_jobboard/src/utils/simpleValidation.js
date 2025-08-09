import { useMemo } from 'react';

// Simple debounce function to prevent excessive validation calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Debounced validation hook to prevent excessive validation calls
export const useDebouncedValidation = (validationFn, delay = 300) => {
  return useMemo(
    () => debounce(validationFn, delay),
    [validationFn, delay]
  );
};

// Simple validation utilities without complex regex
export const simpleValidations = {
  required: (value) => value?.trim() ? '' : 'This field is required',
  
  minLength: (min) => (value) => 
    value?.length >= min ? '' : `Must be at least ${min} characters`,
  
  maxLength: (max) => (value) => 
    value?.length <= max ? '' : `Must not exceed ${max} characters`,
  
  email: (value) => {
    // Simple email check without complex regex
    return value?.includes('@') && value?.includes('.') ? '' : 'Please enter a valid email';
  },
  
  passwordMatch: (password) => (confirmPassword) =>
    password === confirmPassword ? '' : 'Passwords do not match'
};

export default simpleValidations;
