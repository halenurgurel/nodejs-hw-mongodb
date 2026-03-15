import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto'; //node's built-in crypto modules to generate tokens
import {
  FIFTEEN_MINUTES,
  FIVE_MINUTES,
  TEMPLATES_DIR,
  THIRTY_DAYS,
} from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendMail } from '../utils/sendMail.js';
import path from 'node:path';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';

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

//Login Function
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

//reset token function
export const requestResetToken = async (email) => {
  //check if user with this email exists
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found!');

  //create a jwt token containing the user's email, expxires in 5 minutes
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    { expiresIn: FIVE_MINUTES },
  );

  //importing reset-password-email.html
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  //creating template source
  const templateSource = await fs.readFile(resetPasswordTemplatePath, 'utf-8');

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    //build reset link
    resetLink: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  //send the email
  try {
    await sendMail({
      from: env('SMTP_FROM'),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

//reset password service
export const resetPassword = async ({ token, password }) => {
  let entries;
  try {
    entries = jwt.verify(token, env('JWT_SECRET'));
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  //find user by email
  const user = await UsersCollection.findOne({
    email: entries.email,
  });
  //if user is not exist
  if (!user) throw createHttpError(404, 'User not found!');

  //hash the new password
  const encryptedPassword = await bcrypt.hash(password, 10);

  //update users password
  await UsersCollection.updateOne(
    {
      _id: user._id,
    },
    { password: encryptedPassword },
  );

  //delete users current session
  await SessionsCollection.deleteOne({ userId: user._id });
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
