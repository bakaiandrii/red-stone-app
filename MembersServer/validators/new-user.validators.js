const Joi = require('joi');

const { regexpEmail } = require('../config');

module.exports = Joi.object().keys({
  password: Joi.string().trim().min(6).required(),
  email: Joi.string().regex(regexpEmail.EMAIL).max(50).required(),
  first_name: Joi.string().alphanum().trim().min(2).max(50),
  last_name: Joi.string().alphanum().trim().min(2).max(50),
  age: Joi.number().integer().positive().max(100),
});
