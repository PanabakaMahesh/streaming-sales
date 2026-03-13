const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const { user, token } = await authService.register({ name, email, password, role });
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login({ email, password });
      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user._id);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
