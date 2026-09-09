const { query, pool } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const initialGames = [
  {
    title: 'Far Cry Primal',
    title_ar: 'فار كراي برايمال',
    category: 'Action / Adventure',
    description: 'Welcome to the Stone Age, an era of extreme danger and limitless adventure, where giant mammoths and sabretooth tigers rule the Earth.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/371660/capsule_616x353.jpg',
    price_sign: 50,
    price_home: 70,
    price_full: 100,
    is_available_sign: true,
    is_available_home: true,
    is_available_full: true,
    featured: true
  },
  {
    title: 'ReCore',
    title_ar: 'ريكور',
    category: 'Action / Sci-Fi',
    description: 'From legendary creator Keiji Inafune and the makers of Metroid Prime comes ReCore, an action-adventure masterfully crafted for a new generation.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/537450/capsule_616x353.jpg',
    price_sign: null,
    price_home: 70,
    price_full: null,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: false,
    featured: true
  },
  {
    title: "Senua's Saga: Hellblade II (Deluxe Edition)",
    title_ar: 'هيل بليد 2 (ديلوكس)',
    category: 'Action / Psychological Horror',
    description: 'The sequel to the award-winning Hellblade: Senua’s Sacrifice, Senua returns in a brutal journey of survival through the myth and torment of Viking Iceland.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2461850/capsule_616x353.jpg',
    price_sign: 130,
    price_home: 150,
    price_full: 250,
    is_available_sign: true,
    is_available_home: true,
    is_available_full: true,
    featured: true
  },
  {
    title: 'Titanfall 2 (Ultimate Edition)',
    title_ar: 'تايتن فول 2 التيمت',
    category: 'Shooter / FPS',
    description: 'The best way to jump into one of the most surprising shooters of recent memory. Featuring fast-paced multiplayer and an unforgettable single-player campaign.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1237970/capsule_616x353.jpg',
    price_sign: 80,
    price_home: 90,
    price_full: 150,
    is_available_sign: true,
    is_available_home: true,
    is_available_full: true,
    featured: true
  },
  {
    title: "EA Star Wars Triple Bundle + Alan Wake's American Nightmare",
    title_ar: 'باندل ستار وورز الثلاثي + ألان ويك',
    category: 'Bundle / Action',
    description: 'Includes EA Star Wars Triple Bundle (Star Wars Battlefront II, Jedi Fallen Order, Squadrons) plus Alan Wake American Nightmare!',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/capsule_616x353.jpg',
    price_sign: 100,
    price_home: 120,
    price_full: 200,
    is_available_sign: true,
    is_available_home: true,
    is_available_full: true,
    featured: true
  },
  {
    title: 'Injustice 2 (Legendary Edition)',
    title_ar: 'إنجاستس 2 النسخة الأسطورية',
    category: 'Fighting',
    description: 'Power up and build the ultimate version of your favorite DC legends in INJUSTICE 2 - winner of IGN’s best fighting game of 2017.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/627270/capsule_616x353.jpg',
    price_sign: null,
    price_home: 70,
    price_full: 130,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Sunset Overdrive (Deluxe Edition)',
    title_ar: 'سانسيت أوفر درايف',
    category: 'Action / Open World',
    description: 'Don’t drink the energy drink! An open-world shooter without rules where you leap from buildings, grind on power lines, and use an unconventional arsenal.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/847370/capsule_616x353.jpg',
    price_sign: null,
    price_home: 70,
    price_full: 120,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Afterimage',
    title_ar: 'أفتر إيمدج',
    category: 'Metroidvania / 2D Action',
    description: 'A hand-drawn 2D action adventure with fast-paced combat, semi-open world exploration, and deep RPG mechanics.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1701520/capsule_616x353.jpg',
    price_sign: null,
    price_home: 80,
    price_full: 140,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Extinction (Deluxe Edition)',
    title_ar: 'إكستينكشن ديلوكس',
    category: 'Action',
    description: 'Defend humanity from waves of 150-foot tall ogres and their bloodthirsty minions in fast dynamic tactical aerial combat.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570710/capsule_616x353.jpg',
    price_sign: null,
    price_home: 80,
    price_full: 140,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Agatha Christie: Hercule Poirot - The First Cases',
    title_ar: 'أجاثا كريستي: هيركيول بوارو',
    category: 'Mystery / Adventure',
    description: 'Discover an untold crime story from the mysterious youth of the famous detective Hercule Poirot in early 20th-century Europe.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1573720/capsule_616x353.jpg',
    price_sign: null,
    price_home: 120,
    price_full: 180,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Agatha Christie: The ABC Murders',
    title_ar: 'أجاثا كريستي: جرائم الأبجدية',
    category: 'Mystery / Detective',
    description: 'A thrilling mystery and investigation game adapted from the famous Agatha Christie classic novel.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/374900/capsule_616x353.jpg',
    price_sign: null,
    price_home: 120,
    price_full: 180,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Cris Tales',
    title_ar: 'كريس تيلز',
    category: 'RPG / Indie',
    description: 'A gorgeous, indie love letter to classic JRPGs with a unique mechanic to gaze into the past, act in the present, and dynamically alter the future.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1079830/capsule_616x353.jpg',
    price_sign: null,
    price_home: 120,
    price_full: 180,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Flashout 3',
    title_ar: 'فلاش أوت 3',
    category: 'Racing / Sci-Fi',
    description: 'Ultra-fast anti-gravity combat racing with heavy synthwave tracks, devastating weapons, and neck-breaking speeds.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1761870/capsule_616x353.jpg',
    price_sign: null,
    price_home: 120,
    price_full: 180,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Alfred Hitchcock - Vertigo',
    title_ar: 'ألفريد هيتشكوك - فيرتيجو',
    category: 'Narrative / Thriller',
    description: 'A psychological thriller and narrative game inspired by Alfred Hitchcock’s cinema exploring obsession, manipulation and madness.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1449320/capsule_616x353.jpg',
    price_sign: null,
    price_home: 150,
    price_full: 220,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Asterix & Obelix XXL3: The Crystal Menhir',
    title_ar: 'أستريكس وأوبليكس XXL3',
    category: 'Adventure / Co-op',
    description: 'Embark on an exhilarating adventure with Asterix and Obelix as they track down the powers of the mysterious Crystal Menhir!',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1109690/capsule_616x353.jpg',
    price_sign: null,
    price_home: 150,
    price_full: 220,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Demolish & Build 3',
    title_ar: 'ديمولش آند بيلد 3',
    category: 'Simulation / Strategy',
    description: 'Operate heavy machinery, demolish crumbling structures, and expand your own global construction company.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1203670/capsule_616x353.jpg',
    price_sign: null,
    price_home: 150,
    price_full: 220,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Back 4 Blood (Ultimate Edition)',
    title_ar: 'باك 4 بلاد التيمت',
    category: 'Co-op Shooter / Zombie',
    description: 'A thrilling cooperative first-person shooter from the creators of the critically acclaimed Left 4 Dead franchise.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/924970/capsule_616x353.jpg',
    price_sign: null,
    price_home: 180,
    price_full: 280,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  },
  {
    title: 'Cute Puppy Academy Friends Pack',
    title_ar: 'كيوت بابي أكاديمي',
    category: 'Casual / Family',
    description: 'Train, play with, and care for adorable puppies in heartwarming missions built for animal lovers of all ages.',
    image_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2172900/capsule_616x353.jpg',
    price_sign: null,
    price_home: 200,
    price_full: 300,
    is_available_sign: false,
    is_available_home: true,
    is_available_full: true,
    featured: false
  }
];

const initialSettings = [
  { setting_key: 'instapay_username', setting_value: 'vortex.store@instapay', description: 'InstaPay transfer handle' },
  { setting_key: 'vodafone_cash_number', setting_value: '01012345678', description: 'Vodafone Cash mobile wallet number' },
  { setting_key: 'orange_cash_number', setting_value: '01212345678', description: 'Orange Cash mobile wallet number' },
  { setting_key: 'etisalat_cash_number', setting_value: '01112345678', description: 'Etisalat Cash mobile wallet number' },
  { setting_key: 'whatsapp_number', setting_value: '+201012345678', description: 'WhatsApp customer support contact' },
  { setting_key: 'store_announcement', setting_value: '🔥 NEW GAMES ARRIVED! Hot Xbox deals starting from 50 EGP! Instant digital delivery to your console.', description: 'Top announcement ticker' }
];

async function initDb() {
  console.log('🔄 Checking & initializing database schema...');

  // 1. Create tables if PostgreSQL is used
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      name VARCHAR(255),
      role VARCHAR(32) DEFAULT 'USER',
      google_id VARCHAR(255),
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      title_ar VARCHAR(255),
      category VARCHAR(100),
      description TEXT,
      image_url TEXT,
      price_sign NUMERIC(10, 2),
      price_home NUMERIC(10, 2),
      price_full NUMERIC(10, 2),
      is_available_sign BOOLEAN DEFAULT TRUE,
      is_available_home BOOLEAN DEFAULT TRUE,
      is_available_full BOOLEAN DEFAULT TRUE,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64),
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      whatsapp_number VARCHAR(50),
      payment_method VARCHAR(50) DEFAULT 'instapay',
      payment_receipt_url TEXT,
      total_amount NUMERIC(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      product_id VARCHAR(64),
      product_title VARCHAR(255) NOT NULL,
      account_type VARCHAR(50) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      quantity INTEGER DEFAULT 1,
      account_email VARCHAR(255),
      account_password VARCHAR(255),
      account_instructions TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      description TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTablesSql);
  } catch (err) {
    console.warn('Note on table creation:', err.message);
  }

  // 2. Seed Super Admin User if doesn't exist
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vortex.store').toLowerCase();
  const existingAdmin = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
  const defaultPassword = process.env.ADMIN_PASSWORD || 'V0rt3x$2026#Admin!Xb0x';

  if (!existingAdmin.rows || existingAdmin.rows.length === 0) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const adminId = 'admin-' + uuidv4().slice(0, 8);
    await query(
      'INSERT INTO users (id, email, password_hash, name, role, google_id, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [adminId, adminEmail, passwordHash, 'Vortex Admin', 'ADMIN', null, null]
    );
    console.log(`✅ Super Admin created: ${adminEmail} (password: ${defaultPassword})`);
  } else {
    // Ensure role is ADMIN and update password to the complex password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await query('UPDATE users SET role = $1, password_hash = $2 WHERE id = $3', ['ADMIN', passwordHash, existingAdmin.rows[0].id]);
    console.log(`✅ Super Admin refreshed: ${adminEmail}`);
  }

  // 3. Seed Products if catalog is empty, or update image_url if unsplash placeholder
  const existingProducts = await query('SELECT * FROM products');
  if (!existingProducts.rows || existingProducts.rows.length === 0) {
    console.log('🎮 Seeding initial Xbox catalog with official game artwork...');
    for (const game of initialGames) {
      const prodId = 'prod-' + uuidv4().slice(0, 8);
      await query(
        `INSERT INTO products (
          id, title, title_ar, category, description, image_url,
          price_sign, price_home, price_full,
          is_available_sign, is_available_home, is_available_full,
          featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          prodId,
          game.title,
          game.title_ar,
          game.category,
          game.description,
          game.image_url,
          game.price_sign,
          game.price_home,
          game.price_full,
          game.is_available_sign,
          game.is_available_home,
          game.is_available_full,
          game.featured
        ]
      );
    }
    console.log(`✅ Seeded ${initialGames.length} games into catalog.`);
  } else {
    // Update existing products with authentic game cover images if they still have unsplash or missing images
    for (const g of initialGames) {
      const match = existingProducts.rows.find(p => p.title && p.title.toLowerCase() === g.title.toLowerCase());
      if (match && (!match.image_url || match.image_url.includes('unsplash.com'))) {
        await query('UPDATE products SET image_url = $1 WHERE id = $2', [g.image_url, match.id]);
        console.log(`📸 Updated cover image for: "${g.title}"`);
      }
    }
  }

  // 4. Seed Settings if missing
  const existingSettings = await query('SELECT * FROM store_settings');
  if (!existingSettings.rows || existingSettings.rows.length === 0) {
    for (const s of initialSettings) {
      await query(
        'INSERT INTO store_settings (setting_key, setting_value, description) VALUES ($1, $2, $3)',
        [s.setting_key, s.setting_value, s.description]
      );
    }
    console.log('✅ Seeded store settings (InstaPay, Vodafone Cash, WhatsApp).');
  }

  console.log('✨ Database ready.');
}

module.exports = { initDb };
