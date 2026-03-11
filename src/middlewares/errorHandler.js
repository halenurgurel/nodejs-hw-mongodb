import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  //check whether we are getting an error from createHttpError
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    err: err.message,
  });
};
