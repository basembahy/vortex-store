const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', productController.getProducts);
router.get('/template', productController.downloadExcelTemplate);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', verifyToken, requireAdmin, productController.createProduct);
router.put('/:id', verifyToken, requireAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, requireAdmin, productController.deleteProduct);
router.post('/bulk-import', verifyToken, requireAdmin, upload.single('file'), productController.bulkImportExcel);

module.exports = router;
