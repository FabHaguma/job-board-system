const db = require('../../db/database');

// ADMIN: Get all users
const getAllUsers = (req, res) => {
  const sql = 'SELECT id, username, role FROM users';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.json(rows);
  });
};

// ADMIN: Promote a user to admin
const promoteUser = (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE users SET role = 'admin' WHERE id = ? AND role = 'user'`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error promoting user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found or is already an admin.' });
    }
    res.json({ message: `User ${id} has been promoted to admin.` });
  });
};

module.exports = { getAllUsers, promoteUser };