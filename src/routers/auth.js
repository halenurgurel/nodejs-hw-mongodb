import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  loginUserSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import {
  registerUserController,
  loginUserController,
  refreshUserController,
  logoutUserController,
  requestResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

//Register Router
router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

//Login router
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

//reset email router
router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

//reset password router
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

//refresh session based on refresh token saved in cookies
router.post('/refresh', ctrlWrapper(refreshUserController));

//delete the session based on id and token which is saved in cookies
router.post('/logout', ctrlWrapper(logoutUserController));

export default router;
