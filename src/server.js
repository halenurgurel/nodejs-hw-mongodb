import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { env } from './utils/env.js';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../docs/swagger.json');

//Start server
const PORT = Number(env('PORT', 3000));

export const setupServer = () => {
  const app = express();

  //Middleware integrated with Express for processing (parsing) JSON data in requests.
  app.use(express.json());

  //cors
  app.use(cors());

  //cookie-parser
  app.use(cookieParser());

  //pino
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  //routers
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/auth', authRouter);
  app.use(contactsRouter);

  //invalid route
  app.use('*path', notFoundHandler);

  //unexpected errors
  app.use(errorHandler);

  //returns a message indicating that the server is running and on which port it is listening for requests
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
