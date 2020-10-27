const { Router } = require('express');
const crypto = require('crypto');
const Jwt = require('jsonwebtoken');

const { tokinaizer, bcryptHelper } = require('./helpers');
const { checkAccessTokenMiddleware } = require('./midllewares');
const { userService, emailService, connecMongooseService } = require('./services');
const { resetUserPasswordValidator } = require('./validators');

const authRouter = Router();

async function generateTokenWithRole(res, role, _id) {
  let token = tokinaizer(role);
  let resObject = { ...token, _id };
  await userService.updateOneById({ _id }, {
    access_token: token.access_token,
    refresh_token: token.refresh_token
  });
  return res.json(resObject);
};

authRouter.post('/login', async (req, res) => {
    try {
      let { email, password } = req.body;
      await connecMongooseService.connectionDB();

      let user = await userService.findOneByParams({ email });
      if (!user) throw new Error('Email or password is incorrect!');

      let { password: hashedPassword, _id, role } = user;
      let isPasswordEquals = await bcryptHelper.passComparator(password, hashedPassword);
      if (!isPasswordEquals) throw new Error('Email or password is incorrect!');

      if (role === process.env.USER_ROLE_TYPE1) {
        await generateTokenWithRole(res, role, _id);
      } else if (role === process.env.USER_ROLE_TYPE2) {
        await generateTokenWithRole(res, role, _id);
      } else if (role === process.env.USER_ROLE_TYPE3) {
        await generateTokenWithRole(res, role, _id);
      }
    } catch (err) {
      if (err) res.status(404).end(err.message);
    }
  }
);
authRouter.post('/refresh-tokens', async (req, res) => {
    try {
      let refresh_token = req.get('Authorization');
      if (!refresh_token) throw new Error('Refresh token is now valid');

      Jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET, err => {
        if (err) throw new Error('Refresh token is now valid').message;
      });

      await connecMongooseService.connectionDB();
      let user = await userService.findOneByParams({ refresh_token });
      let { _id, role } = user;
      let token = tokinaizer(role);

      await userService.updateOneById({ _id }, {
        access_token: token.access_token,
        refresh_token: token.refresh_token
      });
      return res.json({ ...token, _id });

    } catch (err) {
      if (err) res.status(401).end(err.message);
    }
  }
);
authRouter.post('/logout', checkAccessTokenMiddleware, async (req, res) => {
    try {
      let { _id } = req.user;
      await connecMongooseService.connectionDB();
      await userService.updateOneByParams({ _id }, {
        access_token: '',
        refresh_token: ''
      });

      return res.status(200).end('Logout success');

    } catch (err) {
      if (err) res.status(401).end(err.message);
    }
  }
);
authRouter.post('/forgot', async (req, res, next) => {
    try {
      let { email } = req.body;
      let token = await crypto.randomBytes(20).toString('hex');
      await connecMongooseService.connectionDB();
      let ifExist = await userService.findOneByParams({ email });
      if (!ifExist) throw new Error('No account with that email address exists.');

      await userService.updateOneByParams({ _id: ifExist._id }, { resetPasswordToken: token });

      await emailService.sendMail(email, process.env.FORGOT_PASS_URL + token);

      res.send('<h2>Please check your email!</h2>');
    } catch (err) {
      if (err) res.status(404).end(err.message);
    }
  }
);
authRouter.get('/reset/:token', async (req, res, next) => {
    try {
      await connecMongooseService.connectionDB();
      let user = await userService.findOneByParams({ resetPasswordToken: req.params.token });
      if (!user) throw new Error('Password reset token is invalid');

      res.render('reset', { token: req.params.token });

    } catch (err) {
      if (err) res.status(404).end(err.message);
    }
  }
);
authRouter.post('/reset/:token', async (req, res, next) => {
  let { token } = req.params;
    try {
      let { password } = req.body;

      let { error } = await resetUserPasswordValidator.validate({ password });
      if (error) throw new Error('PASSWORD is not valid!');

      let hashPass = await bcryptHelper.hashPassword(password);

      await connecMongooseService.connectionDB();

      let user = await userService.updateOneByParams({ resetPasswordToken: token },
        { password: hashPass, resetPasswordToken: '' });
      if (!user) throw new Error('Password reset token is invalid');

      res.send('<h2>Success, your password is changed!</h2>');

    } catch (err) {
      if (err) res.status(400).end(err.message);
    }
  }
);

module.exports = authRouter;
