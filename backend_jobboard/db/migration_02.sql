
-- Add company_name to the jobs table
ALTER TABLE jobs ADD COLUMN company_name TEXT;

-- Retroactively add a company name to our sample job for consistency
UPDATE jobs
SET company_name = 'Cat Meme Inc.'
WHERE id = 1;