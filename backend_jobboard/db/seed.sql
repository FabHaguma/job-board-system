-- DML for seeding initial data for Iteration 1

-- Insert a default admin user.
-- The password 'admin123' will be hashed by our registration/seeding script before insertion.
-- This is a placeholder for the logic in the seeder script.
-- For now, we will insert a pre-hashed password.
-- Hashed password for 'admin123' using bcryptjs with 10 salt rounds:
-- $2a$10$w2C8Y0N.xao8gWp5j3fjv.L5nL9Jt6Bqkx40EGknSg48yBGX1d4zG

INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2y$10$1WXy/H4Oc0tJHJY6SAbehu1vcyxraJR2A6ZGosv0PBJ578vk9LSxu', 'admin');

-- Insert a sample job posting
INSERT INTO jobs (title, company_description, job_description, location) VALUES
('Senior React Developer', 'A fast-growing tech startup revolutionizing the cat-meme industry.', 'We are looking for a seasoned React developer to lead our frontend team. You will be responsible for building our next-generation UI.', 'Remote');
