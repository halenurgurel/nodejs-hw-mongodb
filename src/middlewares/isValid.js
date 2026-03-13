import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

//if studentId cannot be found, throw not found
export const isValidId = (req, res, next) => {
  const { studentId } = req.params;
  if (!isValidObjectId(studentId)) {
    throw createHttpError(404, 'Not Found');
  }
  next();
};
