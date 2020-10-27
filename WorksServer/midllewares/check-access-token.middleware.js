const jwt = require('jsonwebtoken');

const { userService, connecMongooseService } = require('../services');
const { appConfig } = require('../config')

module.exports = async (req, res, next) => {
  try {
    const access_token = req.get('Authorization');
    if (!access_token) throw new Error('Token is not valid');

    const token = jwt.verify(access_token, appConfig.JWT_SECRET, err => {
      if (err) throw new Error('Token is not valid');
    });

    await connecMongooseService.connectionDB();
    req.user = await userService.findOneByParams({ access_token });
    if (!req.user) throw new Error('Token is not valid');

    next();
  } catch (err) {
    if (err) res.status(401).end(err.message);
  }
};
