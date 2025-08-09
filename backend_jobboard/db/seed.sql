
-- Admin user (password hash for 'admin123'), test user (password hash for 'test123')
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2y$10$1WXy/H4Oc0tJHJY6SAbehu1vcyxraJR2A6ZGosv0PBJ578vk9LSxu', 'admin'),
('test', '$2a$12$V2rMH9WCnxthOT46QdhKMOomXqaO9iovoRidESxS57CwX3pQgt7i.', 'user');

-- Job postings (3 sample jobs, including original React role + 2 non-tech)
INSERT INTO jobs (
	title,
	company_name,
	company_description,
	job_description,
	location,
	requirements,
	salary,
	tags,
	deadline,
	is_archived
) VALUES
(
	'Senior React Developer',
	'Cat Meme Inc.',
	'A fast-growing tech startup revolutionizing the cat-meme industry.',
	'We are looking for a seasoned React developer to lead our frontend team. You will be responsible for building our next-generation UI.',
	'Remote',
	'5+ years React; Strong state management experience (Redux or similar); RESTful APIs; Testing best practices.',
	'$120,000 - $150,000 per year',
	'react,frontend,javascript,remote',
	'2024-12-31 23:59:59',
	0
),
(
	'Operations Manager',
	'Handspun Hope',
	'Regional supplier of organic produce partnering with local farms to deliver fresh food to urban markets.',
	'Lead day-to-day logistics, vendor coordination, and process improvements across our distribution network.',
	'Musanze, CO (Hybrid)',
	'5+ years operations or supply chain; Excel & data analysis; Team leadership; Lean / process improvement mindset.',
	'Rwf800,000 - Rwf1,200,000 plus performance bonus',
	'operations,supply-chain,leadership,hybrid',
	'2025-11-30 23:59:59',
	0
),
(
	'Community Outreach Coordinator',
	'Kigali Path Youth Services',
	'Non-profit organization focused on after-school enrichment for underserved communities.',
	'Design and execute outreach initiatives, manage volunteer onboarding, and build partnerships with local schools and sponsors.',
	'On-site - Nyamirambo',
	'2+ years community engagement; Strong communication & public speaking; Event coordination; Passion for youth development.',
	'Rwf250,000 - Rwf400,000',
	'nonprofit,community,outreach,full-time',
	'2025-10-15 23:59:59',
	0
);
