import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import JobDetailPage from '../src/pages/JobDetailPage';
import authSlice from '../src/features/auth/authSlice';
import api from '../src/services/api';

vi.mock('../src/services/api');

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

const mockJob = {
  id: 1,
  title: 'Software Engineer',
  company_name: 'Tech Corp',
  company_description: 'A leading tech company',
  location: 'Remote',
  salary: '100,000 USD',
  job_description: 'Develop amazing software.',
  requirements: 'React, Node.js',
  tags: 'engineering,full-stack',
};

describe('JobDetailPage', () => {
  it('should render job details correctly', async () => {
    api.get.mockResolvedValue({ data: mockJob });
    const store = createMockStore({ user: null });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/job/1']}>
          <Routes>
            <Route path="/job/:id" element={<JobDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Remote')).toBeInTheDocument();
    });
  });

  it('should show apply button for logged-in users', async () => {
    api.get.mockResolvedValue({ data: mockJob });
    const store = createMockStore({ user: { role: 'user' } });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/job/1']}>
          <Routes>
            <Route path="/job/:id" element={<JobDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Apply for this Job')).toBeInTheDocument();
    });
  });

  it('should not show apply button for guests', async () => {
    api.get.mockResolvedValue({ data: mockJob });
    const store = createMockStore({ user: null });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/job/1']}>
          <Routes>
            <Route path="/job/:id" element={<JobDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Apply for this Job')).not.toBeInTheDocument();
    });
  });
});
