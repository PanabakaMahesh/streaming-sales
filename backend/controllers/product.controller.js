const productService = require('../services/product.service');

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '', category = '' } = req.query;
      const { products, total } = await productService.getAllProducts({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category,
      });
      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: { product } });
    } catch (error) {
      next(error);
    }
  }

  async getMyProducts(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const { products, total } = await productService.getProductsBySeller(req.user._id, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      res.status(200).json({
        success: true,
        data: {
          products,
          pagination: { total, page: parseInt(page), limit: parseInt(limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.user._id, req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id, req.user._id);
      res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
