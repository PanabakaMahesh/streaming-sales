const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/error.middleware');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ min: 2, max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('category').optional().trim(),
  body('images').optional().isArray(),
];

const updateProductValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 0 }),
];

// Public routes
router.get('/', productController.getAllProducts);

// Seller-only protected routes — MUST be before /:id to avoid route conflict
router.get('/seller/my', authenticate, authorize('seller'), productController.getMyProducts);

router.get('/:id', productController.getProductById);

router.post(
  '/',
  authenticate,
  authorize('seller'),
  productValidation,
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('seller'),
  updateProductValidation,
  validateRequest,
  productController.updateProduct
);

router.delete('/:id', authenticate, authorize('seller'), productController.deleteProduct);

module.exports = router;
