/**
 * Utility helpers for consistent API responses.
 * Extend this module as the API grows.
 */

const paginate = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
});

const success = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { paginate, success, error };
