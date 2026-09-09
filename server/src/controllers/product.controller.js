const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');
const fs = require('fs');

// Get all products with search & filters
exports.getProducts = async (req, res) => {
  try {
    const { search, category, account_type, featured, sort } = req.query;

    const result = await query('SELECT * FROM products');
    let products = result.rows || [];

    // Filter by search (case-insensitive in title, title_ar, category)
    if (search) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.title_ar && p.title_ar.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      products = products.filter((p) => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
    }

    // Filter by account type availability
    if (account_type) {
      const at = account_type.toLowerCase();
      if (at === 'sign') {
        products = products.filter((p) => p.is_available_sign && p.price_sign != null);
      } else if (at === 'home') {
        products = products.filter((p) => p.is_available_home && p.price_home != null);
      } else if (at === 'full') {
        products = products.filter((p) => p.is_available_full && p.price_full != null);
      }
    }

    // Filter featured
    if (featured === 'true') {
      products = products.filter((p) => p.featured === true);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => {
        const minA = Math.min(...[a.price_sign, a.price_home, a.price_full].filter((x) => x != null));
        const minB = Math.min(...[b.price_sign, b.price_home, b.price_full].filter((x) => x != null));
        return minA - minB;
      });
    } else if (sort === 'price_desc') {
      products.sort((a, b) => {
        const maxA = Math.max(...[a.price_sign, a.price_home, a.price_full].filter((x) => x != null));
        const maxB = Math.max(...[b.price_sign, b.price_home, b.price_full].filter((x) => x != null));
        return maxB - maxA;
      });
    } else if (sort === 'name') {
      products.sort((a, b) => a.title.localeCompare(b.title));
    }

    return res.json({ count: products.length, products });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ message: 'Error fetching product' });
  }
};

// Create product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      title_ar,
      category,
      description,
      image_url,
      price_sign,
      price_home,
      price_full,
      is_available_sign,
      is_available_home,
      is_available_full,
      featured
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Game title is required' });
    }

    const prodId = 'prod-' + uuidv4().slice(0, 8);
    const result = await query(
      `INSERT INTO products (
        id, title, title_ar, category, description, image_url,
        price_sign, price_home, price_full,
        is_available_sign, is_available_home, is_available_full,
        featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        prodId,
        title.trim(),
        title_ar ? title_ar.trim() : null,
        category ? category.trim() : 'Xbox',
        description || '',
        image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        price_sign != null && price_sign !== '' ? Number(price_sign) : null,
        price_home != null && price_home !== '' ? Number(price_home) : null,
        price_full != null && price_full !== '' ? Number(price_full) : null,
        is_available_sign !== false && is_available_sign !== 'false',
        is_available_home !== false && is_available_home !== 'false',
        is_available_full !== false && is_available_full !== 'false',
        featured === true || featured === 'true'
      ]
    );

    return res.status(201).json({ message: 'Product created successfully', product: result.rows[0] });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      title_ar,
      category,
      description,
      image_url,
      price_sign,
      price_home,
      price_full,
      is_available_sign,
      is_available_home,
      is_available_full,
      featured
    } = req.body;

    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const current = existing.rows[0];
    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedTitleAr = title_ar !== undefined ? (title_ar ? title_ar.trim() : null) : current.title_ar;
    const updatedCategory = category !== undefined ? category.trim() : current.category;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedImg = image_url !== undefined ? image_url : current.image_url;
    const updatedPriceSign = price_sign !== undefined && price_sign !== '' ? (price_sign == null ? null : Number(price_sign)) : current.price_sign;
    const updatedPriceHome = price_home !== undefined && price_home !== '' ? (price_home == null ? null : Number(price_home)) : current.price_home;
    const updatedPriceFull = price_full !== undefined && price_full !== '' ? (price_full == null ? null : Number(price_full)) : current.price_full;
    const updatedAvailSign = is_available_sign !== undefined ? Boolean(is_available_sign) : current.is_available_sign;
    const updatedAvailHome = is_available_home !== undefined ? Boolean(is_available_home) : current.is_available_home;
    const updatedAvailFull = is_available_full !== undefined ? Boolean(is_available_full) : current.is_available_full;
    const updatedFeatured = featured !== undefined ? Boolean(featured) : current.featured;

    const result = await query(
      `UPDATE products SET
        title = $1,
        title_ar = $2,
        category = $3,
        description = $4,
        image_url = $5,
        price_sign = $6,
        price_home = $7,
        price_full = $8,
        is_available_sign = $9,
        is_available_home = $10,
        is_available_full = $11,
        featured = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 RETURNING *`,
      [
        updatedTitle,
        updatedTitleAr,
        updatedCategory,
        updatedDesc,
        updatedImg,
        updatedPriceSign,
        updatedPriceHome,
        updatedPriceFull,
        updatedAvailSign,
        updatedAvailHome,
        updatedAvailFull,
        updatedFeatured,
        id
      ]
    );

    return res.json({ message: 'Product updated successfully', product: result.rows[0] });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ message: 'Error deleting product' });
  }
};

// Bulk Import from Excel / CSV (Admin)
exports.bulkImportExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel or CSV file' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'The uploaded sheet has no rows' });
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      // Find title from various possible header names
      const title = row['Title'] || row['Game Title'] || row['اسم اللعبة'] || row['عنوان'] || row['title'];
      if (!title) continue;

      const title_ar = row['Title_AR'] || row['Title AR'] || row['Arabic Title'] || row['الاسم بالعربي'] || null;
      const category = row['Category'] || row['التصنيف'] || row['القسم'] || 'Xbox';
      const description = row['Description'] || row['الوصف'] || '';
      const image_url = row['Image_Url'] || row['Image'] || row['صورة'] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

      const price_sign_raw = row['Price_Sign'] || row['Sign Price'] || row['سعر الساين'] || row['Sign'] || null;
      const price_home_raw = row['Price_Home'] || row['Home Price'] || row['سعر الهوم'] || row['Home'] || null;
      const price_full_raw = row['Price_Full'] || row['Full Price'] || row['سعر الكامل'] || row['Full'] || null;

      const price_sign = price_sign_raw !== '' && price_sign_raw != null ? Number(price_sign_raw) : null;
      const price_home = price_home_raw !== '' && price_home_raw != null ? Number(price_home_raw) : null;
      const price_full = price_full_raw !== '' && price_full_raw != null ? Number(price_full_raw) : null;

      const is_available_sign = price_sign != null;
      const is_available_home = price_home != null;
      const is_available_full = price_full != null;

      // Check if product already exists by title
      const existing = await query('SELECT * FROM products WHERE LOWER(title) = $1', [title.trim().toLowerCase()]);
      if (existing.rows && existing.rows.length > 0) {
        // Update prices and info
        const prod = existing.rows[0];
        await query(
          `UPDATE products SET
            title_ar = $1,
            category = $2,
            description = $3,
            image_url = $4,
            price_sign = $5,
            price_home = $6,
            price_full = $7,
            is_available_sign = $8,
            is_available_home = $9,
            is_available_full = $10,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $11`,
          [
            title_ar || prod.title_ar,
            category || prod.category,
            description || prod.description,
            image_url || prod.image_url,
            price_sign != null ? price_sign : prod.price_sign,
            price_home != null ? price_home : prod.price_home,
            price_full != null ? price_full : prod.price_full,
            is_available_sign,
            is_available_home,
            is_available_full,
            prod.id
          ]
        );
        updatedCount++;
      } else {
        // Insert new product
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
            title.trim(),
            title_ar ? title_ar.trim() : null,
            category,
            description,
            image_url,
            price_sign,
            price_home,
            price_full,
            is_available_sign,
            is_available_home,
            is_available_full,
            false
          ]
        );
        insertedCount++;
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // ignore
    }

    return res.json({
      message: `Excel sheet processed successfully: ${insertedCount} new games added, ${updatedCount} games updated.`,
      inserted: insertedCount,
      updated: updatedCount
    });
  } catch (err) {
    console.error('bulkImportExcel error:', err);
    return res.status(500).json({ message: 'Error processing Excel sheet: ' + err.message });
  }
};

// Download sample Excel template
exports.downloadExcelTemplate = (req, res) => {
  try {
    const templateData = [
      {
        Title: 'Grand Theft Auto V',
        Title_AR: 'جي تي ايه 5',
        Category: 'Action / Open World',
        Price_Sign: 70,
        Price_Home: 90,
        Price_Full: 160,
        Image_Url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        Description: 'Complete edition for Xbox One & Series X|S'
      },
      {
        Title: 'Cyberpunk 2077',
        Title_AR: 'سايبر بانك 2077',
        Category: 'RPG / Sci-Fi',
        Price_Sign: 100,
        Price_Home: 130,
        Price_Full: 220,
        Image_Url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        Description: 'An open-world, action-adventure RPG set in Night City'
      },
      {
        Title: 'FIFA 24 / EA Sports FC 24',
        Title_AR: 'فيفا 24',
        Category: 'Sports',
        Price_Sign: 120,
        Price_Home: 150,
        Price_Full: 250,
        Image_Url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        Description: 'Next gen soccer experience on Xbox'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products_Template');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="vortex_store_games_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (err) {
    console.error('downloadExcelTemplate error:', err);
    return res.status(500).json({ message: 'Error creating Excel template' });
  }
};
