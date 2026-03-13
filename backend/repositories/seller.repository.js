const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');

class SellerRepository {
  async findProfileByUserId(userId) {
    return SellerProfile.findOne({ userId }).populate('userId', 'name email createdAt');
  }

  async findProfileById(id) {
    return SellerProfile.findById(id).populate('userId', 'name email createdAt');
  }

  async updateProfile(userId, updateData) {
    return SellerProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');
  }

  async getAllSellers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [profiles, total] = await Promise.all([
      SellerProfile.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SellerProfile.countDocuments(),
    ]);
    return { profiles, total };
  }
}

module.exports = new SellerRepository();
