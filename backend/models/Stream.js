const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Stream title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    streamKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    streamURL: {
      type: String,
      default: '',
    },
    thumbnailURL: {
      type: String,
      default: '',
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    viewerCount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    // Products featured in this stream
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    // Placeholder for future streaming provider integration
    providerData: {
      provider: { type: String, default: '' }, // e.g. 'livekit', 'agora', 'webrtc'
      roomId: { type: String, default: '' },
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  {
    timestamps: true,
  }
);

streamSchema.index({ sellerId: 1, isLive: 1 });

module.exports = mongoose.model('Stream', streamSchema);
