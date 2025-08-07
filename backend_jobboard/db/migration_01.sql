-- Migration to add features for Iteration 2

-- Add new columns to the jobs table
ALTER TABLE jobs ADD COLUMN requirements TEXT;
ALTER TABLE jobs ADD COLUMN salary TEXT; -- Storing as TEXT for flexibility (e.g., "$80k - $100k", "Competitive")
ALTER TABLE jobs ADD COLUMN tags TEXT; -- Comma-separated tags
ALTER TABLE jobs ADD COLUMN deadline DATETIME;
ALTER TABLE jobs ADD COLUMN is_archived INTEGER DEFAULT 0; -- SQLite uses 0 for false, 1 for true

-- Add status to the applications table
ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'accepted', 'rejected'));

-- Update existing sample job with new data for testing
UPDATE jobs
SET 
  requirements = '5+ years of React experience, Strong understanding of state management (Redux), Experience with RESTful APIs.',
  salary = '$120,000 - $150,000 per year',
  tags = 'react,frontend,javascript,remote',
  deadline = '2024-12-31 23:59:59'
WHERE id = 1;