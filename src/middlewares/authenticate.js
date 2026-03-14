import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  //read authorization header
  const authHeader = req.get('Authorization');
  //if missing throw 401
  if (!authHeader) throw createHttpError(401, 'Please provide authorization');

  //split it to extract token
  const [bearer, token] = authHeader.split(' ');

  //if not Bearer format throw 401
  if (bearer !== 'Bearer' || !token)
    throw createHttpError(401, 'Authorization header must be of type Bearer');

  //find the session by access token
  const session = await SessionsCollection.findOne({ accessToken: token });

  //if it is not found throw 401
  if (!session) throw createHttpError(401, 'Session not found');

  //if accesstoken is not valid
  if (new Date() > session.accessTokenValidUntil)
    throw createHttpError(401, 'Access token expired');

  //find user
  const user = await UsersCollection.findById(session.userId);

  //if user does not exist
  if (!user) throw createHttpError(401, 'User not found');

  req.user = user;
  next();
};
