const streamService = require('../services/stream.service');

class StreamController {
  async createStream(req, res, next) {
    try {
      const { title, description, featuredProducts } = req.body;
      const stream = await streamService.createStream(req.user._id, {
        title,
        description,
        featuredProducts,
      });
      res.status(201).json({
        success: true,
        message: 'Stream session created.',
        data: { stream },
      });
    } catch (error) {
      next(error);
    }
  }

  async startStream(req, res, next) {
    try {
      const result = await streamService.startStream(req.params.id, req.user._id);
      res.status(200).json({ success: true, message: result.message, data: result });
    } catch (error) {
      next(error);
    }
  }

  async stopStream(req, res, next) {
    try {
      const stream = await streamService.stopStream(req.params.id, req.user._id);
      res.status(200).json({
        success: true,
        message: 'Stream ended successfully.',
        data: { stream },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveStreams(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const { streams, total } = await streamService.getLiveStreams({
        page: parseInt(page),
        limit: parseInt(limit),
      });
      res.status(200).json({
        success: true,
        data: { streams, pagination: { total, page: parseInt(page), limit: parseInt(limit) } },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStreamById(req, res, next) {
    try {
      const stream = await streamService.getStreamById(req.params.id);
      res.status(200).json({ success: true, data: { stream } });
    } catch (error) {
      next(error);
    }
  }

  async getMyStreams(req, res, next) {
    try {
      const streams = await streamService.getMyStreams(req.user._id);
      res.status(200).json({ success: true, data: { streams } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StreamController();
