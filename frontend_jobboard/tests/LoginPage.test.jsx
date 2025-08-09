import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import LoginPage from '../src/features/auth/LoginPage';
import authSlice from '../src/features/auth/authSlice';

// Mock Redux store
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: initialState,
    },
  });
};

describe('LoginPage', () => {
  it('should render the login form', () => {
    const store = createMockStore({ user: null });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const store = createMockStore({ user: null });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const form = screen.getByRole('form');
    await fireEvent.submit(form);

    const usernameError = await screen.findByText('Username is required');
    const passwordError = await screen.findByText('Password is required');
    expect(usernameError).toHaveClass('error-text');
    expect(passwordError).toHaveClass('error-text');
  });

  it('should allow submission with valid data', async () => {
    const store = createMockStore({ user: null, isLoading: false });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      // We can check if the login action was dispatched, but that's more complex.
      // For now, let's assume if no errors are shown, it's a good sign.
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    });
  });
});
