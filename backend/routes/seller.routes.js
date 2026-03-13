const express = require('express');
const { body } = require('express-validator');
const sellerController = require('../controllers/seller.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/error.middleware');

const router = express.Router();

const updateProfileValidation = [
  body('storeName').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

// Public routes
router.get('/', sellerController.getAllSellers);
router.get('/:id', sellerController.getSellerById);

// Protected seller-only routes
router.get('/me/profile', authenticate, authorize('seller'), sellerController.getMyProfile);
router.put(
  '/update',
  authenticate,
  authorize('seller'),
  updateProfileValidation,
  validateRequest,
  sellerController.updateProfile
);

module.exports = router;
