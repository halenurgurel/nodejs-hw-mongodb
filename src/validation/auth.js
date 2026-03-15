import Joi from 'joi';

//Register section -> we will come back later to bcrypt password
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

//Login section
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

//Reset email schema
export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

//reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
});
