-- Drop tables if they exist (clean slate for init)
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin'))
);

-- Jobs Table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company_name TEXT,
    company_description TEXT NOT NULL,
    job_description TEXT NOT NULL,
    location TEXT,
    requirements TEXT, 
    salary TEXT,
    tags TEXT, -- comma-separated tags
    deadline DATETIME,
    is_archived INTEGER DEFAULT 0, -- (0=false,1=true)
    date_posted DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table 
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    cover_letter TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','reviewed','accepted','rejected')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(job_id, user_id)
);