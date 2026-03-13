const productRepository = require('../repositories/product.repository');
const sellerRepository = require('../repositories/seller.repository');

class ProductService {

  async getAllProducts({ page, limit, search, category }) {
    return productRepository.findAll({ page, limit, search, category });
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);

    if (!product || !product.isActive) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async getProductsBySeller(sellerId, options) {
    return productRepository.findBySeller(sellerId, options);
  }

  async createProduct(sellerId, productData) {
    const product = await productRepository.create({
      ...productData,
      sellerId,
    });

    // Increment seller's total products count
    await sellerRepository.updateProfile(sellerId, {
      $inc: { totalProducts: 1 },
    });

    return product;
  }

  async updateProduct(productId, sellerId, updateData) {
    const allowedFields = [
      'name',
      'description',
      'price',
      'quantity',
      'images',
      'category',
    ];

    const filteredData = {};

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const product = await productRepository.update(
      productId,
      sellerId,
      filteredData
    );

    if (!product) {
      const error = new Error(
        'Product not found or you do not have permission to edit it.'
      );
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async deleteProduct(productId, sellerId) {
    const product = await productRepository.hardDelete(productId, sellerId);

    if (!product) {
      const error = new Error(
        'Product not found or you do not have permission to delete it.'
      );
      error.statusCode = 404;
      throw error;
    }

    await sellerRepository.updateProfile(sellerId, {
      $inc: { totalProducts: -1 },
    });

    return product;
  }

}

module.exports = new ProductService();