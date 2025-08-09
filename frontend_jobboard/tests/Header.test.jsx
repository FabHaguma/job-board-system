import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect } from 'vitest';
import Header from '../src/components/Header';
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

describe('Header', () => {
  it('should render the component', () => {
    const store = createMockStore({ user: null });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Job Board Platform')).toBeInTheDocument();
  });

  it('should show the "Admin Dashboard" link for admin users', () => {
    const store = createMockStore({ user: { role: 'admin', username: 'Admin User' } });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should show the login and register buttons for guests', () => {
    const store = createMockStore({ user: null });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should show the user menu for logged-in users', () => {
    const store = createMockStore({ user: { username: 'Test User' } });
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
