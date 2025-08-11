import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApplyForm from '../src/features/jobs/ApplyForm';
import api from '../src/services/api';

vi.mock('../src/services/api', () => ({
  default: {
    post: vi.fn()
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ApplyForm', () => {
  const renderApplyForm = (jobId = 1) => {
    return render(
      <MemoryRouter>
        <ApplyForm jobId={jobId} />
      </MemoryRouter>
    );
  };

  it('should render the apply form', () => {
    renderApplyForm();
    expect(screen.getByPlaceholderText('Your Cover Letter')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload CV (PDF only)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to Job Openings' })).toBeInTheDocument();
  });

  it('should show an error if the form is submitted with empty fields', async () => {
    renderApplyForm();
    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // Check for the notification modal with error message
    const errorTitle = await screen.findByText('Missing Information');
    expect(errorTitle).toBeInTheDocument();
    
    const errorMessage = await screen.findByText('Please provide both a cover letter and a CV file.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('should submit the form with valid data', async () => {
    const mockResponse = { status: 200, data: { message: 'Application submitted successfully!' } };
    api.post.mockResolvedValueOnce(mockResponse);
    
    renderApplyForm();

    const coverLetterInput = screen.getByPlaceholderText('Your Cover Letter');
    const cvInput = screen.getByLabelText('Upload CV (PDF only)');
    const form = screen.getByRole('form');

    const file = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });

    await userEvent.type(coverLetterInput, 'This is my cover letter.');
    await userEvent.upload(cvInput, file);
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/jobs/1/apply',
        expect.any(FormData)
      );
    });

    // Check for the notification modal with success message
    const successTitle = await screen.findByText('Success!');
    expect(successTitle).toBeInTheDocument();
    
    const successMessage = await screen.findByText('Application submitted successfully!');
    expect(successMessage).toBeInTheDocument();
  });
});
