const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper to generate VTX-XXXXX order ID
const generateOrderId = () => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `VTX-${randomDigits}`;
};

// Create new customer order
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      whatsapp_number,
      payment_method,
      items: rawItems,
      notes
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({ message: 'Customer name, email, and phone are required' });
    }

    let items = [];
    try {
      items = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid items payload' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one game item' });
    }

    // Handle uploaded transaction receipt screenshot
    let payment_receipt_url = null;
    if (req.file) {
      payment_receipt_url = `/uploads/${req.file.filename}`;
    }

    // Calculate total amount
    const total_amount = items.reduce((acc, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return acc + p * q;
    }, 0);

    const orderId = generateOrderId();
    const userId = req.user ? req.user.id : null;

    // Insert order
    await query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, whatsapp_number,
        payment_method, payment_receipt_url, total_amount, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        orderId,
        userId,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
        whatsapp_number ? whatsapp_number.trim() : customer_phone.trim(),
        payment_method || 'instapay',
        payment_receipt_url,
        total_amount,
        'PENDING',
        notes || ''
      ]
    );

    // Insert order items
    for (const item of items) {
      const itemId = 'item-' + uuidv4().slice(0, 8);
      await query(
        `INSERT INTO order_items (
          id, order_id, product_id, product_title, account_type, price, quantity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          itemId,
          orderId,
          item.product_id || null,
          item.product_title || 'Xbox Game',
          (item.account_type || 'HOME').toUpperCase(),
          Number(item.price),
          Number(item.quantity || 1)
        ]
      );
    }

    return res.status(201).json({
      message: 'Order created successfully! We will verify your payment and prepare your account credentials.',
      order_id: orderId,
      total_amount,
      status: 'PENDING'
    });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ message: 'Error creating order' });
  }
};

// Get single order with items
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.query;

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id.trim()]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRes.rows[0];

    // Authorization check: if user is admin, allow; if user is the owner, allow; if phone matches, allow (for guest lookup)
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const isOwner = req.user && req.user.id && req.user.id === order.user_id;
    const phoneMatches = phone && order.customer_phone.replace(/\D/g, '').includes(phone.replace(/\D/g, ''));

    if (!isAdmin && !isOwner && !phoneMatches) {
      // Return masked order summary for public lookup if phone not verified
      const itemsRes = await query('SELECT id, product_title, account_type, price, quantity FROM order_items WHERE order_id = $1', [order.id]);
      return res.json({
        order: {
          id: order.id,
          customer_name: order.customer_name ? order.customer_name[0] + '***' : '',
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
          items: itemsRes.rows,
          requires_verification: true
        }
      });
    }

    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    order.items = itemsRes.rows;

    return res.json({ order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Error retrieving order' });
  }
};

// Get logged-in user orders
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    // Find orders by user_id or customer_email
    const ordersRes = await query('SELECT * FROM orders');
    const myOrders = (ordersRes.rows || []).filter(
      (o) => o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail)
    );

    // Attach items to each order
    for (const order of myOrders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }

    return res.json({ orders: myOrders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ message: 'Error fetching customer orders' });
  }
};

// Admin: Get all orders with status filtering & search
exports.adminGetOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const ordersRes = await query('SELECT * FROM orders');
    let orders = ordersRes.rows || [];

    if (status && status !== 'ALL') {
      orders = orders.filter((o) => o.status.toUpperCase() === status.toUpperCase());
    }

    if (search) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q)
      );
    }

    for (const order of orders) {
      const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }

    return res.json({ count: orders.length, orders });
  } catch (err) {
    console.error('adminGetOrders error:', err);
    return res.status(500).json({ message: 'Error fetching orders for admin' });
  }
};

// Admin: Update order status
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [
      status.toUpperCase(),
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: `Order status updated to ${status.toUpperCase()}`, order: result.rows[0] });
  } catch (err) {
    console.error('adminUpdateOrderStatus error:', err);
    return res.status(500).json({ message: 'Error updating order status' });
  }
};

// Admin: Fulfill order and deliver Xbox account credentials
exports.adminFulfillOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items_credentials, mark_completed } = req.body;

    // Check order exists
    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update credentials for each order item
    if (Array.isArray(items_credentials)) {
      for (const cred of items_credentials) {
        if (cred.id) {
          await query(
            `UPDATE order_items SET
              account_email = $1,
              account_password = $2,
              account_instructions = $3
            WHERE id = $4`,
            [cred.account_email || '', cred.account_password || '', cred.account_instructions || '', cred.id]
          );
        }
      }
    }

    // Optionally mark order as COMPLETED
    if (mark_completed !== false) {
      await query("UPDATE orders SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
    }

    // Fetch updated order & items
    const updatedOrderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const updatedOrder = updatedOrderRes.rows[0];
    updatedOrder.items = itemsRes.rows;

    return res.json({
      message: 'Xbox account credentials delivered and order marked as completed!',
      order: updatedOrder
    });
  } catch (err) {
    console.error('adminFulfillOrder error:', err);
    return res.status(500).json({ message: 'Error fulfilling order' });
  }
};
