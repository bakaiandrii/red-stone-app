const jwt = require('jsonwebtoken');

const { userService, connecMongooseService } = require('../../services');


module.exports = async (req, res, next) => {
  try {
    const access_token = req.get('Authorization');

    if (!access_token) throw new Error('Token is not valid').message;


    const token = jwt.verify(access_token, process.env.JWT_SECRET, err => {
      if (err) {
        throw new Error('Token is not valid').message;
      }
    });


    await connecMongooseService.connectionDB();
    req.user = await userService.findOneByParams({ access_token });
    if (!req.user) throw new Error('Token is not valid').message;

    next();
  } catch (e) {

    next(e);
  }

};
