const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const Order = require('../models/Order');

class OrderService {

  async placeOrder(buyerId, { productId, quantity, shippingAddress }) {

    const product = await productRepository.findById(productId);

    if (!product || !product.isActive) {
      const error = new Error('Product not found or no longer available.');
      error.statusCode = 404;
      throw error;
    }

    if (product.quantity < quantity) {
      const error = new Error(
        `Insufficient stock. Only ${product.quantity} units available.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Decrement stock directly (no transaction needed for standalone MongoDB)
    const updatedProduct = await productRepository.decrementQuantity(
      productId,
      quantity,
      null
    );

    if (!updatedProduct) {
      const error = new Error('Failed to reserve stock. Please try again.');
      error.statusCode = 400;
      throw error;
    }

    const order = await orderRepository.create({
      buyerId,
      sellerId: product.sellerId,
      productId,
      quantity,
      priceAtPurchase: product.price,
      totalAmount: product.price * quantity,
      shippingAddress,
      statusHistory: [
        { status: Order.ORDER_STATUS.PLACED }
      ],
    });

    return order;
  }

  async getBuyerOrders(buyerId, options) {
    return orderRepository.findByBuyer(buyerId, options);
  }

  async getSellerOrders(sellerId, options) {
    return orderRepository.findBySeller(sellerId, options);
  }

  async getOrderById(orderId, userId, role) {

    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error('Order not found.');
      error.statusCode = 404;
      throw error;
    }

    // Verify user has access to this order
    const isOwner =
      (role === 'buyer' &&
        order.buyerId._id.toString() === userId.toString()) ||
      (role === 'seller' &&
        order.sellerId._id.toString() === userId.toString());

    if (!isOwner) {
      const error = new Error(
        'You do not have permission to view this order.'
      );
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  async updateOrderStatus(orderId, sellerId, status, note) {

    const validStatuses = Object.values(Order.ORDER_STATUS);

    if (!validStatuses.includes(status)) {
      const error = new Error(
        `Invalid status. Valid values: ${validStatuses.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    const order = await orderRepository.updateStatus(
      orderId,
      sellerId,
      status,
      note
    );

    if (!order) {
      const error = new Error(
        'Order not found or you do not have permission to update it.'
      );
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

}

module.exports = new OrderService();