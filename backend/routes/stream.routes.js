const express = require('express');
const { body } = require('express-validator');
const streamController = require('../controllers/stream.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/error.middleware');

const router = express.Router();

// Public routes
router.get('/live', streamController.getLiveStreams);
router.get('/:id', streamController.getStreamById);

// Seller-only routes
router.get('/seller/my', authenticate, authorize('seller'), streamController.getMyStreams);

router.post(
  '/',
  authenticate,
  authorize('seller'),
  body('title').trim().notEmpty().withMessage('Stream title is required'),
  validateRequest,
  streamController.createStream
);

router.post('/start/:id', authenticate, authorize('seller'), streamController.startStream);
router.post('/stop/:id', authenticate, authorize('seller'), streamController.stopStream);

module.exports = router;
