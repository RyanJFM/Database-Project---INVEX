const db = require('../config/db');

// POST /api/auth/login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const query = `
      SELECT u.user_id, u.username, u.password_hash, u.full_name, r.role_name 
      FROM User u
      INNER JOIN User_Role r ON u.role_id = r.role_id
      WHERE u.username = ?
    `;
    const [rows] = await db.query(query, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];

    // Verify password directly against the database seed values (e.g., 'hashed_pw_123')
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role_name
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// GET /api/auth/users
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.user_id, u.username, u.full_name, r.role_name, r.role_id 
      FROM User u
      INNER JOIN User_Role r ON u.role_id = r.role_id
      ORDER BY u.user_id DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// POST /api/auth/users
exports.createUser = async (req, res) => {
  const { username, password, full_name, role_id } = req.body;

  if (!username || !password || !full_name || !role_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if username exists
    const [existing] = await db.query('SELECT user_id FROM User WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const [result] = await db.query(
      'INSERT INTO User (role_id, username, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [parseInt(role_id), username, password, full_name]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// GET /api/auth/roles
exports.getRoles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT role_id, role_name FROM User_Role');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

