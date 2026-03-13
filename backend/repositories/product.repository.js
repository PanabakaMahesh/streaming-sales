const Product = require('../models/Product');

class ProductRepository {

  async findAll({ page = 1, limit = 20, search = '', category = '' } = {}) {
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('sellerId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Product.countDocuments(query),
    ]);

    return { products, total };
  }

  async findById(id) {
    return Product.findById(id)
      .populate('sellerId', 'name email');
  }

  async findBySeller(sellerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Product.countDocuments({ sellerId }),
    ]);

    return { products, total };
  }

  async create(productData) {
    return Product.create(productData);
  }

  async update(id, sellerId, updateData) {
    return Product.findOneAndUpdate(
      { _id: id, sellerId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id, sellerId) {
    return Product.findOneAndUpdate(
      { _id: id, sellerId },
      { $set: { isActive: false } },
      { new: true }
    );
  }

  async hardDelete(id, sellerId) {
    return Product.findOneAndDelete({
      _id: id,
      sellerId,
    });
  }

  async decrementQuantity(productId, quantity, session) {

    const options = {
      new: true,
    };

    if (session) {
      options.session = session;
    }

    return Product.findOneAndUpdate(
      {
        _id: productId,
        quantity: { $gte: quantity },
      },
      {
        $inc: { quantity: -quantity },
      },
      options
    );
  }

}

module.exports = new ProductRepository();