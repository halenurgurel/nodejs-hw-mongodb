//process invalid routes
import createHttpError from 'http-errors';

export const notFoundHandler = (req, res) => {
  throw createHttpError(404, 'Route not found');
};
