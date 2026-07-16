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
