const Joi = require('joi');

const { regexpEmail } = require('../config');

module.exports = Joi.object().keys({
  password: Joi.string().trim().min(6).required(),
});
