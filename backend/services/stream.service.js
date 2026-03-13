const streamRepository = require('../repositories/stream.repository');

/**
 * StreamService - Business logic for live streaming module.
 *
 * Architecture Note:
 * This module is intentionally designed as a thin shell.
 * In Phase 2, the actual streaming provider (LiveKit, Agora, WebRTC)
 * will be injected here via a StreamProviderAdapter interface.
 *
 * Example future extension point:
 *   const provider = StreamProviderFactory.create(process.env.STREAM_PROVIDER);
 *   const roomData = await provider.createRoom(stream.streamKey);
 */
class StreamService {
  async createStream(sellerId, { title, description, featuredProducts }) {
    // Stop any currently live streams for this seller (one stream at a time)
    await streamRepository.stopAllSellerStreams(sellerId);

    const stream = await streamRepository.create(sellerId, {
      title,
      description,
      featuredProducts: featuredProducts || [],
    });

    return stream;
  }

  async startStream(streamId, sellerId) {
    const stream = await streamRepository.startStream(streamId, sellerId);
    if (!stream) {
      const error = new Error('Stream not found or you do not have permission.');
      error.statusCode = 404;
      throw error;
    }

    /**
     * FUTURE INTEGRATION POINT:
     * const roomToken = await streamingProvider.generateRoomToken(stream.streamKey);
     * stream.providerData = { ...roomToken };
     */

    return {
      stream,
      message: 'Stream started. Connect your streaming software using the stream key.',
      // Placeholder fields for future streaming provider integration
      rtmpUrl: 'rtmp://placeholder.streamingsales.com/live',
      streamKey: stream.streamKey,
    };
  }

  async stopStream(streamId, sellerId) {
    const stream = await streamRepository.stopStream(streamId, sellerId);
    if (!stream) {
      const error = new Error('Stream not found or you do not have permission.');
      error.statusCode = 404;
      throw error;
    }

    /**
     * FUTURE INTEGRATION POINT:
     * await streamingProvider.closeRoom(stream.streamKey);
     */

    return stream;
  }

  async getLiveStreams(options) {
    return streamRepository.findLiveStreams(options);
  }

  async getStreamById(streamId) {
    const stream = await streamRepository.findById(streamId);
    if (!stream) {
      const error = new Error('Stream not found.');
      error.statusCode = 404;
      throw error;
    }
    return stream;
  }

  async getMyStreams(sellerId) {
    return streamRepository.findBySeller(sellerId);
  }
}

module.exports = new StreamService();
