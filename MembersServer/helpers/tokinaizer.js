const jwt = require('jsonwebtoken');

const { appConfig } = require('../config');

module.exports = (role) => {
  const access_token = jwt.sign({role}, appConfig.JWT_SECRET, { expiresIn: appConfig.ACCESS_TOKEN_LIFETIME });
  const refresh_token = jwt.sign({role}, appConfig.JWT_REFRESH_SECRET, { expiresIn: appConfig.REFRESH_TOKEN_LIFETIME });
  return {
    access_token,
    refresh_token
  }
}
