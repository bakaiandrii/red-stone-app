const jwt = require('jsonwebtoken');

const { appConfig } = require('../config');

module.exports = (role) => {
  const access_token = jwt.sign({role}, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFETIME });
  const refresh_token = jwt.sign({role}, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_LIFETIME });
  return {
    access_token,
    refresh_token
  }
}
