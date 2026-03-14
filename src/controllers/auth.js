import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
} from '../services/auth.js';

//helper function for res.cookie
const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

//Register Controller
export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

//Login Controller
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  //Save refresh token in an HTTP-only cookie with res.cookie which is built-into express
  setupSession(res, session);

  //returning access token in the response body
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

//refreshUser controller
export const refreshUserController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

//Logout controller
export const logoutUserController = async (req, res) => {
  //Eğer cookies'de sessionId varsa bunu logoutUser servisini kullanarak sileceğiz.
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  //clear cookies
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  //return status
  res.status(204).send();
};
