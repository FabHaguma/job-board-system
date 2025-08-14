const db = require('../../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const role = 'user'; // Default role

  const sql = 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)';
  db.run(sql, [username, password_hash, role], function(err) {
    if (err) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // Auto-generate JWT token upon successful registration (auto-login)
    try {
      const token = jwt.sign(
        { id: this.lastID, role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(201).json({
        token,
        user: {
          id: this.lastID,
          username,
          role,
        },
      });
    } catch (e) {
      // If token generation fails, still return created user without token
      return res.status(201).json({
        user: { id: this.lastID, username, role },
      });
    }
  });
};

const loginUser = (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';

  db.get(sql, [username], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  });
};

module.exports = { registerUser, loginUser };