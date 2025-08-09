import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  it('should render the apply form', () => {
    render(<ApplyForm jobId={1} />);
    expect(screen.getByPlaceholderText('Your Cover Letter')).toBeInTheDocument();
    expect(screen.getByLabelText('Upload CV (PDF only)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeInTheDocument();
  });

  it('should show an error if the form is submitted with empty fields', async () => {
    render(<ApplyForm jobId={1} />);
    const form = screen.getByRole('form');
    await fireEvent.submit(form);

    const errorMessage = await screen.findByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' && 
             content.includes('Please provide both a cover letter and a CV file');
    });
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('should submit the form with valid data', async () => {
    const mockResponse = { status: 200, data: { message: 'Application submitted successfully!' } };
    api.post.mockResolvedValueOnce(mockResponse);
    
    render(<ApplyForm jobId={1} />);

    const coverLetterInput = screen.getByPlaceholderText('Your Cover Letter');
    const cvInput = screen.getByLabelText('Upload CV (PDF only)');
    const form = screen.getByRole('form');

    const file = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });

    await userEvent.type(coverLetterInput, 'This is my cover letter.');
    await userEvent.upload(cvInput, file);
    await fireEvent.submit(form);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/jobs/1/apply',
        expect.any(FormData)
      );
    });

    const successMessage = await screen.findByText('Application submitted successfully!');
    expect(successMessage).toBeInTheDocument();
    expect(successMessage).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });
});
