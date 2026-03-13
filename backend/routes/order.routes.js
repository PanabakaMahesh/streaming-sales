const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/error.middleware');

const router = express.Router();

const placeOrderValidation = [
  body('productId').notEmpty().isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').notEmpty().withMessage('Pincode is required'),
];

// Buyer routes
router.post(
  '/',
  authenticate,
  authorize('buyer'),
  placeOrderValidation,
  validateRequest,
  orderController.placeOrder
);

router.get('/buyer', authenticate, authorize('buyer'), orderController.getBuyerOrders);

// Seller routes
router.get('/seller', authenticate, authorize('seller'), orderController.getSellerOrders);

router.patch(
  '/:id/status',
  authenticate,
  authorize('seller'),
  body('status').notEmpty().withMessage('Status is required'),
  validateRequest,
  orderController.updateOrderStatus
);

// Shared (buyer or seller can view their own order)
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;
