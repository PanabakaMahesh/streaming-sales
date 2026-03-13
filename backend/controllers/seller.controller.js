const sellerService = require('../services/seller.service');

class SellerController {
  async getSellerById(req, res, next) {
    try {
      const profile = await sellerService.getSellerById(req.params.id);
      res.status(200).json({ success: true, data: { profile } });
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const profile = await sellerService.getSellerProfile(req.user._id);
      res.status(200).json({ success: true, data: { profile } });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await sellerService.updateProfile(req.user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSellers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { profiles, total } = await sellerService.getAllSellers(page, limit);
      res.status(200).json({
        success: true,
        data: { profiles, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SellerController();
