const mailer = require('nodemailer');
const EmailTemplates = require('email-templates');
const path = require('path');

const { appConfig } = require('../config');

const emailTemplates = new EmailTemplates({
  message: null,
  views: {
    root: path.join(process.cwd(), 'email-templates')
  }
});

const transporter = mailer.createTransport({
  service: process.env.ROOT_EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.ROOT_EMAIL,
    pass: process.env.ROOT_EMAIL_PASSWORD
  }
});

class EmailService {
  async sendMail(userMail, resetURL) {
    try {
      const html = await emailTemplates.render('forgot-pass', {
        frontUrl: resetURL
      });
      const mailOptions = {
        from: 'NO REPLY ',
        to: userMail,
        subject: '[TEST APP FORGOT PASS]',
        html
      };
      return transporter.sendMail(mailOptions);

    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new EmailService();
