const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  archiveJob,
  getAdminAllJobs,
  updateApplicationStatus,
  getJobApplications,
  getAllApplications
} = require('../../src/controllers/jobController');
const { createTestDB, initTestDB, cleanupTestDB } = require('../helpers/dbHelper');
const { mockJobs } = require('../helpers/testData');

// Mock the database module
jest.mock('../../db/database');
const db = require('../../db/database');

describe('Job Controller', () => {
  let mockReq, mockRes, testDB;

  beforeAll(async () => {
    testDB = createTestDB();
    await initTestDB(testDB);
  });

  afterAll(async () => {
    await cleanupTestDB(testDB);
  });

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: 'user' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllJobs', () => {
    it('should get all jobs with pagination', () => {
      mockReq.query = { page: 1, limit: 10 };

      const mockJobs = [
        { id: 1, title: 'Software Developer', is_archived: 0 },
        { id: 2, title: 'Marketing Manager', is_archived: 0 }
      ];

      // Mock the main query
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockJobs);
      });

      // Mock the count query
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, { count: 2 });
      });

      getAllJobs(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM jobs WHERE is_archived = 0'),
        expect.arrayContaining([10, 0]),
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockJobs,
        totalPages: 1,
        currentPage: 1
      });
    });

    it('should filter jobs by search term', () => {
      mockReq.query = { search: 'developer', page: 1, limit: 10 };

      const mockJobs = [
        { id: 1, title: 'Software Developer', is_archived: 0 }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockJobs);
      });

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, { count: 1 });
      });

      getAllJobs(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('AND (title LIKE ? OR company_description LIKE ?)'),
        expect.arrayContaining(['%developer%', '%developer%', 10, 0]),
        expect.any(Function)
      );
    });

    it('should handle database error', () => {
      mockReq.query = { page: 1, limit: 10 };

      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      getAllJobs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving jobs',
        error: 'Database error'
      });
    });
  });

  describe('getJobById', () => {
    it('should get a job by ID', () => {
      mockReq.params = { id: '1' };

      const mockJob = { id: 1, title: 'Software Developer', is_archived: 0 };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockJob);
      });

      getJobById(mockReq, mockRes);

      expect(db.get).toHaveBeenCalledWith(
        'SELECT * FROM jobs WHERE id = ? AND is_archived = 0',
        ['1'],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockJob);
    });

    it('should return 404 if job not found', () => {
      mockReq.params = { id: '999' };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      getJobById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job not found or has been archived'
      });
    });

    it('should handle database error', () => {
      mockReq.params = { id: '1' };

      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      getJobById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving job'
      });
    });
  });

  describe('createJob', () => {
    it('should create a new job successfully', () => {
      mockReq.body = mockJobs.valid;

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      createJob(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO jobs'),
        expect.arrayContaining([
          mockJobs.valid.title,
          mockJobs.valid.company_name,
          mockJobs.valid.company_description,
          mockJobs.valid.job_description,
          mockJobs.valid.location,
          mockJobs.valid.requirements,
          mockJobs.valid.salary,
          mockJobs.valid.tags,
          mockJobs.valid.deadline
        ]),
        expect.any(Function)
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle database error', () => {
      mockReq.body = mockJobs.valid;

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      createJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error creating job',
        error: 'Database error'
      });
    });
  });

  describe('updateJob', () => {
    it('should update a job successfully', () => {
      mockReq.params = { id: '1' };
      mockReq.body = mockJobs.update;

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      updateJob(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE jobs SET'),
        expect.arrayContaining([
          mockJobs.update.title,
          mockJobs.update.company_name,
          mockJobs.update.company_description,
          mockJobs.update.job_description,
          mockJobs.update.location,
          mockJobs.update.requirements,
          mockJobs.update.salary,
          mockJobs.update.tags,
          mockJobs.update.deadline,
          '1'
        ]),
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job 1 updated successfully'
      });
    });

    it('should handle database error', () => {
      mockReq.params = { id: '1' };
      mockReq.body = mockJobs.update;

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error updating job',
        error: 'Database error'
      });
    });
  });

  describe('archiveJob', () => {
    it('should archive a job successfully', () => {
      mockReq.params = { id: '1' };

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      archiveJob(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE jobs SET is_archived = 1 WHERE id = ?',
        ['1'],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job 1 archived successfully'
      });
    });

    it('should handle database error', () => {
      mockReq.params = { id: '1' };

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      archiveJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error archiving job'
      });
    });
  });

  describe('getAdminAllJobs', () => {
    it('should get all jobs including archived ones', () => {
      const mockJobs = [
        { id: 1, title: 'Active Job', is_archived: 0 },
        { id: 2, title: 'Archived Job', is_archived: 1 }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockJobs);
      });

      getAdminAllJobs(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        'SELECT * FROM jobs ORDER BY date_posted DESC',
        [],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockJobs);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status successfully', () => {
      mockReq.params = { appId: '1' };
      mockReq.body = { status: 'accepted' };

      db.run.mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      updateApplicationStatus(mockReq, mockRes);

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE applications SET status = ? WHERE id = ?',
        ['accepted', '1'],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application 1 status updated to accepted'
      });
    });

    it('should return 400 for invalid status', () => {
      mockReq.params = { appId: '1' };
      mockReq.body = { status: 'invalid_status' };

      updateApplicationStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid status'
      });
      expect(db.run).not.toHaveBeenCalled();
    });
  });

  describe('getJobApplications', () => {
    it('should get applications for a specific job', () => {
      mockReq.params = { id: '1' };

      const mockApplications = [
        {
          id: 1,
          status: 'pending',
          username: 'testuser',
          cover_letter: 'Cover letter content',
          cv_url: '/uploads/cvs/test.pdf',
          created_at: '2024-01-01'
        }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      getJobApplications(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT a.id, a.status, u.username, a.cover_letter, a.cv_url'),
        ['1'],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
    });
  });

  describe('getAllApplications', () => {
    it('should get all applications across all jobs', () => {
      const mockApplications = [
        {
          id: 1,
          status: 'pending',
          username: 'testuser',
          job_title: 'Software Developer',
          company_name: 'Tech Corp'
        }
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      getAllApplications(mockReq, mockRes);

      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT a.id, a.status, u.username, a.cover_letter, a.cv_url, a.application_date'),
        [],
        expect.any(Function)
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
    });
  });
});
