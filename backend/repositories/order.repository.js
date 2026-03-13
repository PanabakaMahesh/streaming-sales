const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    const order = await Order.create(orderData);
    return order.populate([
      { path: 'productId', select: 'name images price' },
      { path: 'sellerId', select: 'name' },
    ]);
  }

  async findByBuyer(buyerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ buyerId })
        .populate('productId', 'name images price')
        .populate('sellerId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ buyerId }),
    ]);
    return { orders, total };
  }

  async findBySeller(sellerId, { page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const query = { sellerId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('productId', 'name images price')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);
    return { orders, total };
  }

  async findById(id) {
    return Order.findById(id)
      .populate('productId', 'name images price description')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email');
  }

  async updateStatus(orderId, sellerId, status, note = '') {
    return Order.findOneAndUpdate(
      { _id: orderId, sellerId },
      {
        $set: { status },
        $push: { statusHistory: { status, note } },
      },
      { new: true }
    );
  }
}

module.exports = new OrderRepository();
