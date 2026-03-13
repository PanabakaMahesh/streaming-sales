const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

class AuthRepository {
  async findUserByEmail(email) {
    return User.findOne({ email }).select('+password');
  }

  async findUserById(id) {
    return User.findById(id);
  }

  async createUser(userData) {
    return User.create(userData);
  }

  async createSellerProfile(userId, storeName) {
    return SellerProfile.create({ userId, storeName });
  }
}

module.exports = new AuthRepository();
