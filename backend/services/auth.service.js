const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');

class AuthService {
  _generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  async register({ name, email, password, role }) {
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const user = await authRepository.createUser({ name, email, password, role });

    // Auto-create seller profile when role is seller
    if (role === 'seller') {
      await authRepository.createSellerProfile(user._id, `${name}'s Store`);
    }

    const token = this._generateToken(user._id);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated.');
      error.statusCode = 403;
      throw error;
    }

    const token = this._generateToken(user._id);
    return { user, token };
  }

  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }
}

module.exports = new AuthService();
