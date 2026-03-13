const Stream = require('../models/Stream');
const crypto = require('crypto');

class StreamRepository {
  _generateStreamKey() {
    return crypto.randomBytes(16).toString('hex');
  }

  async create(sellerId, streamData) {
    return Stream.create({
      ...streamData,
      sellerId,
      streamKey: this._generateStreamKey(),
    });
  }

  async findById(id) {
    return Stream.findById(id).populate('sellerId', 'name').populate('featuredProducts', 'name price images');
  }

  async findLiveStreams({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [streams, total] = await Promise.all([
      Stream.find({ isLive: true })
        .populate('sellerId', 'name')
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit),
      Stream.countDocuments({ isLive: true }),
    ]);
    return { streams, total };
  }

  async findBySeller(sellerId) {
    return Stream.find({ sellerId }).sort({ createdAt: -1 }).limit(10);
  }

  async startStream(streamId, sellerId) {
    return Stream.findOneAndUpdate(
      { _id: streamId, sellerId },
      { $set: { isLive: true, startedAt: new Date() } },
      { new: true }
    );
  }

  async stopStream(streamId, sellerId) {
    return Stream.findOneAndUpdate(
      { _id: streamId, sellerId },
      { $set: { isLive: false, endedAt: new Date() } },
      { new: true }
    );
  }

  async stopAllSellerStreams(sellerId) {
    return Stream.updateMany(
      { sellerId, isLive: true },
      { $set: { isLive: false, endedAt: new Date() } }
    );
  }
}

module.exports = new StreamRepository();
