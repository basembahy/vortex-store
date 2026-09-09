const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register with Email & Password
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const lowerEmail = email.trim().toLowerCase();
    const existing = await query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr-' + uuidv4().slice(0, 8);

    const result = await query(
      'INSERT INTO users (id, email, password_hash, name, role, google_id, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role, avatar',
      [userId, lowerEmail, passwordHash, name.trim(), 'USER', null, null]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

// Login with Email & Password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const lowerEmail = email.trim().toLowerCase();
    const result = await query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

// Google OAuth Login / Register
exports.googleLogin = async (req, res) => {
  try {
    const { credential, clientId } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required' });
    }

    let payload;
    try {
      // If GOOGLE_CLIENT_ID is configured, verify with Google client
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } else {
        // Fallback: decode JWT payload from Google token
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, 'base64')
            .toString('utf-8')
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        payload = JSON.parse(jsonPayload);
      }
    } catch (verifyErr) {
      console.error('Google token verification error:', verifyErr);
      return res.status(400).json({ message: 'Invalid Google authentication token' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const lowerEmail = email.toLowerCase();

    // Check if user exists by email or google_id
    let userResult = await query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
    let user;

    if (userResult.rows.length === 0) {
      // Create new user with Google details
      const userId = 'usr-' + uuidv4().slice(0, 8);
      const inserted = await query(
        'INSERT INTO users (id, email, password_hash, name, role, google_id, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userId, lowerEmail, null, name || 'Vortex Gamer', 'USER', googleId, picture || null]
      );
      user = inserted.rows[0];
    } else {
      user = userResult.rows[0];
      // Update google_id and avatar if missing
      if (!user.google_id || !user.avatar) {
        await query('UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3', [googleId, picture || user.avatar, user.id]);
        user.google_id = googleId;
        user.avatar = picture || user.avatar;
      }
    }

    const token = generateToken(user);

    return res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Google login route error:', err);
    return res.status(500).json({ message: 'Internal server error during Google login' });
  }
};

// Current User Profile
exports.me = async (req, res) => {
  try {
    const result = await query('SELECT id, email, name, role, avatar, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return res.status(500).json({ message: 'Error retrieving user profile' });
  }
};
