import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res) => {
  //check whether we are getting an error from createHttpError
  if (err instanceof HttpError) {
    req.json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }
  res.json({
    status: 500,
    message: 'Something went wrong',
    err: err.message,
  });
};
