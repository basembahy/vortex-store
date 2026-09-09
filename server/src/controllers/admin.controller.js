const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Admin Analytics Overview
exports.getStats = async (req, res) => {
  try {
    const ordersRes = await query('SELECT * FROM orders');
    const productsRes = await query('SELECT * FROM products');
    const usersRes = await query('SELECT id, role FROM users');

    const orders = ordersRes.rows || [];
    const products = productsRes.rows || [];
    const users = usersRes.rows || [];

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

    const totalRevenue = orders
      .filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const pendingRevenue = orders
      .filter((o) => o.status === 'PENDING')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return res.json({
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      total_revenue: totalRevenue,
      pending_revenue: pendingRevenue,
      total_products: products.length,
      total_users: users.length,
      admin_users_count: users.filter((u) => u.role === 'ADMIN').length
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ message: 'Error retrieving admin stats' });
  }
};

// List all users
exports.getUsers = async (req, res) => {
  try {
    const result = await query('SELECT id, email, name, role, google_id, avatar, created_at FROM users');
    return res.json({ users: result.rows || [] });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

// Update user role (Promote to ADMIN / demote to USER)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ message: 'Role must be ADMIN or USER' });
    }

    // Prevent demoting oneself
    if (req.user.id === id && role !== 'ADMIN') {
      return res.status(400).json({ message: 'You cannot revoke your own admin rights' });
    }

    const result = await query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role', [role, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: `User role updated to ${role}`, user: result.rows[0] });
  } catch (err) {
    console.error('updateUserRole error:', err);
    return res.status(500).json({ message: 'Error updating user role' });
  }
};

// Create new Admin User
exports.createAdminUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const lowerEmail = email.trim().toLowerCase();
    const existing = await query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminId = 'admin-' + uuidv4().slice(0, 8);

    const result = await query(
      'INSERT INTO users (id, email, password_hash, name, role, google_id, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role',
      [adminId, lowerEmail, passwordHash, name.trim(), 'ADMIN', null, null]
    );

    return res.status(201).json({ message: 'New admin created successfully', user: result.rows[0] });
  } catch (err) {
    console.error('createAdminUser error:', err);
    return res.status(500).json({ message: 'Error creating admin user' });
  }
};
