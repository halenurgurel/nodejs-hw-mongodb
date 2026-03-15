import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto'; //node's built-in crypto modules to generate tokens
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';

//helper function to create new session
const createSession = () => {
  //Generate new tokens
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

//Register function
export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  //if there is already an email registered on the system - we throw 409 to specify that email is already using in the system.
  if (user) throw createHttpError(409, 'Email in use');

  //encrypted password - using bcrypt.hash to encrypt the plain-text password with salt round of 10. This means the raw password is never stored in the database
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  //user creation section - spreads the original payload (name, email etc) into new document. however replaces password with the hashed version. and then saves to the UsersCollection
  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

//Login Helper Function
//we will return 401 since we are not revealing that whether email exists in our system or not for safety reasons. We only say that credentials are invalid. User should know which one is wrong.
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(401, 'Unauthorized');

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) throw createHttpError(401, 'Unauthorized');

  //deleting existing session for that user by userId -> user.id in our case user._id since the id is defined as _id
  await SessionsCollection.deleteOne({ userId: user._id });

  //create new session
  const newSession = createSession();

  //Creare and return the new session
  //these are coming from models
  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

//refresh users service
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  //find the session by refreshToken from cookies with findOne
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  //if there are no sessions, return 401
  if (!session) throw createHttpError(401, 'Session not found');

  //if token is expired
  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh Token expired');
  }

  //delete the old version
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  //Create new sessions
  const newSession = createSession();
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

//LOGOUT service function
export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
