import Joi from 'joi';

//Register section -> we will come back later to bcrypt password
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().required(),
  password: Joi.string().required,
});

//Login section
export const loginUserSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
