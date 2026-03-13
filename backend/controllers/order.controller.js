const orderService = require('../services/order.service');

class OrderController {
  async placeOrder(req, res, next) {
    try {
      const { productId, quantity, shippingAddress } = req.body;
      const order = await orderService.placeOrder(req.user._id, {
        productId,
        quantity,
        shippingAddress,
      });
      res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBuyerOrders(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const { orders, total } = await orderService.getBuyerOrders(req.user._id, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: { total, page: parseInt(page), limit: parseInt(limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSellerOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const { orders, total } = await orderService.getSellerOrders(req.user._id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });
      res.status(200).json({
        success: true,
        data: {
          orders,
          pagination: { total, page: parseInt(page), limit: parseInt(limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
      res.status(200).json({ success: true, data: { order } });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status, note } = req.body;
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.user._id,
        status,
        note
      );
      res.status(200).json({
        success: true,
        message: 'Order status updated.',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
