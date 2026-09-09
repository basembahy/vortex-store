const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
let useLocalDb = false;

// Path for local dev fallback database
const localDbPath = path.join(__dirname, '../../data/local_db.json');

let memoryDb = {
  users: [],
  products: [],
  orders: [],
  order_items: [],
  store_settings: []
};

const loadLocalDb = () => {
  try {
    const dir = path.dirname(localDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(localDbPath)) {
      const data = fs.readFileSync(localDbPath, 'utf8');
      memoryDb = JSON.parse(data);
    }
  } catch (err) {
    console.warn('⚠️ Could not load local db, using empty:', err.message);
  }
};

const saveLocalDb = () => {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local db:', err.message);
  }
};

if (process.env.DATABASE_URL) {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });

  console.log('📦 PostgreSQL connection pool initialized with DATABASE_URL');
} else {
  console.log('ℹ️ No DATABASE_URL provided. Using high-performance zero-setup local persistent JSON database.');
  useLocalDb = true;
  loadLocalDb();
}

/**
 * Execute a query. Works with PostgreSQL if DATABASE_URL is present,
 * or handles standard app queries locally so it runs instantly anywhere.
 */
async function query(text, params = []) {
  if (pool && !useLocalDb) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      // If PostgreSQL connection fails in local dev, gracefully fallback
      if (process.env.NODE_ENV !== 'production' && !useLocalDb) {
        console.warn('⚠️ PostgreSQL query failed, switching to local DB fallback:', err.message);
        useLocalDb = true;
        loadLocalDb();
        return query(text, params);
      }
      throw err;
    }
  }

  // --- Local DB SQL Emulator for Zero-Setup Dev Mode ---
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Handle table creation queries
  if (lower.startsWith('create table')) {
    return { rows: [] };
  }

  // Handle SELECT store_settings
  if (lower.includes('from store_settings')) {
    return { rows: [...memoryDb.store_settings] };
  }

  // Handle SELECT users
  if (lower.includes('from users')) {
    if (lower.includes('where email = $1')) {
      const user = memoryDb.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
      return { rows: user ? [user] : [] };
    }
    if (lower.includes('where id = $1')) {
      const user = memoryDb.users.find(u => u.id === params[0]);
      return { rows: user ? [user] : [] };
    }
    if (lower.includes('where google_id = $1')) {
      const user = memoryDb.users.find(u => u.google_id === params[0]);
      return { rows: user ? [user] : [] };
    }
    return { rows: [...memoryDb.users] };
  }

  // Handle INSERT INTO users
  if (lower.startsWith('insert into users')) {
    // ($1, $2, $3, $4, $5, $6)
    const newUser = {
      id: params[0],
      email: params[1],
      password_hash: params[2],
      name: params[3],
      role: params[4] || 'USER',
      google_id: params[5] || null,
      avatar: params[6] || null,
      created_at: new Date().toISOString()
    };
    memoryDb.users.push(newUser);
    saveLocalDb();
    return { rows: [newUser] };
  }

  // Handle UPDATE users
  if (lower.startsWith('update users')) {
    if (lower.includes('set role = $1, password_hash = $2 where id = $3')) {
      const user = memoryDb.users.find(u => u.id === params[2]);
      if (user) {
        user.role = params[0];
        user.password_hash = params[1];
        saveLocalDb();
      }
      return { rows: user ? [user] : [] };
    }
    if (lower.includes('set role = $1 where id = $2')) {
      const user = memoryDb.users.find(u => u.id === params[1]);
      if (user) {
        user.role = params[0];
        saveLocalDb();
      }
      return { rows: user ? [user] : [] };
    }
  }

  // Handle SELECT products
  if (lower.includes('from products')) {
    if (lower.includes('where id = $1')) {
      const prod = memoryDb.products.find(p => p.id === params[0]);
      return { rows: prod ? [prod] : [] };
    }
    return { rows: [...memoryDb.products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)) };
  }

  // Handle INSERT INTO products
  if (lower.startsWith('insert into products')) {
    const newProd = {
      id: params[0],
      title: params[1],
      title_ar: params[2],
      category: params[3],
      description: params[4],
      image_url: params[5],
      price_sign: params[6] != null ? Number(params[6]) : null,
      price_home: params[7] != null ? Number(params[7]) : null,
      price_full: params[8] != null ? Number(params[8]) : null,
      is_available_sign: params[9] !== false,
      is_available_home: params[10] !== false,
      is_available_full: params[11] !== false,
      featured: Boolean(params[12]),
      created_at: new Date().toISOString()
    };
    memoryDb.products.push(newProd);
    saveLocalDb();
    return { rows: [newProd] };
  }

  // Handle UPDATE products
  if (lower.startsWith('update products')) {
    const id = params[params.length - 1];
    const prod = memoryDb.products.find(p => p.id === id);
    if (prod) {
      if (lower.includes('set image_url = $1')) {
        prod.image_url = params[0];
      } else {
        prod.title = params[0];
        prod.title_ar = params[1];
        prod.category = params[2];
        prod.description = params[3];
        prod.image_url = params[4];
        prod.price_sign = params[5] != null ? Number(params[5]) : null;
        prod.price_home = params[6] != null ? Number(params[6]) : null;
        prod.price_full = params[7] != null ? Number(params[7]) : null;
        prod.is_available_sign = Boolean(params[8]);
        prod.is_available_home = Boolean(params[9]);
        prod.is_available_full = Boolean(params[10]);
        prod.featured = Boolean(params[11]);
      }
      prod.updated_at = new Date().toISOString();
      saveLocalDb();
      return { rows: [prod] };
    }
    return { rows: [] };
  }

  // Handle DELETE FROM products
  if (lower.startsWith('delete from products')) {
    const id = params[0];
    const index = memoryDb.products.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = memoryDb.products.splice(index, 1);
      saveLocalDb();
      return { rows: deleted };
    }
    return { rows: [] };
  }

  // Handle SELECT orders
  if (lower.includes('from orders')) {
    if (lower.includes('where id = $1')) {
      const order = memoryDb.orders.find(o => o.id === params[0]);
      return { rows: order ? [order] : [] };
    }
    if (lower.includes('where user_id = $1')) {
      const orders = memoryDb.orders.filter(o => o.user_id === params[0]);
      return { rows: orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    }
    return { rows: [...memoryDb.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
  }

  // Handle INSERT INTO orders
  if (lower.startsWith('insert into orders')) {
    const newOrder = {
      id: params[0],
      user_id: params[1] || null,
      customer_name: params[2],
      customer_email: params[3],
      customer_phone: params[4],
      whatsapp_number: params[5],
      payment_method: params[6],
      payment_receipt_url: params[7],
      total_amount: Number(params[8]),
      status: params[9] || 'PENDING',
      notes: params[10] || '',
      created_at: new Date().toISOString()
    };
    memoryDb.orders.push(newOrder);
    saveLocalDb();
    return { rows: [newOrder] };
  }

  // Handle UPDATE orders
  if (lower.startsWith('update orders')) {
    const id = params[params.length - 1];
    const order = memoryDb.orders.find((o) => o.id === id);
    if (order) {
      if (lower.includes("status = 'completed'")) {
        order.status = 'COMPLETED';
      } else if (lower.includes('status = $1')) {
        order.status = params[0];
      }
      order.updated_at = new Date().toISOString();
      saveLocalDb();
    }
    return { rows: order ? [order] : [] };
  }

  // Handle SELECT order_items
  if (lower.includes('from order_items')) {
    if (lower.includes('where order_id = $1')) {
      const items = memoryDb.order_items.filter(i => i.order_id === params[0]);
      return { rows: items };
    }
    return { rows: [...memoryDb.order_items] };
  }

  // Handle INSERT INTO order_items
  if (lower.startsWith('insert into order_items')) {
    const newItem = {
      id: params[0],
      order_id: params[1],
      product_id: params[2],
      product_title: params[3],
      account_type: params[4],
      price: Number(params[5]),
      quantity: Number(params[6] || 1),
      account_email: params[7] || null,
      account_password: params[8] || null,
      account_instructions: params[9] || null
    };
    memoryDb.order_items.push(newItem);
    saveLocalDb();
    return { rows: [newItem] };
  }

  // Handle UPDATE order_items (delivering credentials)
  if (lower.startsWith('update order_items')) {
    const id = params[3];
    const item = memoryDb.order_items.find(i => i.id === id);
    if (item) {
      item.account_email = params[0];
      item.account_password = params[1];
      item.account_instructions = params[2];
      saveLocalDb();
      return { rows: [item] };
    }
    return { rows: [] };
  }

  // Store settings insert/upsert
  if (lower.startsWith('insert into store_settings') || lower.startsWith('update store_settings')) {
    const key = params[0];
    const value = params[1];
    const idx = memoryDb.store_settings.findIndex(s => s.setting_key === key);
    if (idx !== -1) {
      memoryDb.store_settings[idx].setting_value = value;
    } else {
      memoryDb.store_settings.push({ setting_key: key, setting_value: value });
    }
    saveLocalDb();
    return { rows: [{ setting_key: key, setting_value: value }] };
  }

  return { rows: [] };
}

module.exports = {
  query,
  pool,
  getMemoryDb: () => memoryDb
};
