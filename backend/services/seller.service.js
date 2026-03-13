const sellerRepository = require('../repositories/seller.repository');

class SellerService {
  async getSellerProfile(userId) {
    const profile = await sellerRepository.findProfileByUserId(userId);
    if (!profile) {
      const error = new Error('Seller profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return profile;
  }

  async getSellerById(sellerId) {
    const profile = await sellerRepository.findProfileByUserId(sellerId);
    if (!profile) {
      const error = new Error('Seller not found.');
      error.statusCode = 404;
      throw error;
    }
    return profile;
  }

  async updateProfile(userId, updateData) {
    const allowedFields = ['storeName', 'description', 'profileImage'];
    const filteredData = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const profile = await sellerRepository.updateProfile(userId, filteredData);
    if (!profile) {
      const error = new Error('Seller profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return profile;
  }

  async getAllSellers(page, limit) {
    return sellerRepository.getAllSellers(page, limit);
  }
}

module.exports = new SellerService();
