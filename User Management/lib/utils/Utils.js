/* eslint-disable radix,guard-for-in,no-restricted-syntax,no-extend-native */

// eslint-disable-next-line no-unused-vars
const _ = require('lodash');
const nodeMailer = require('nodemailer');

if (typeof String.prototype.startsWith !== 'function') {
  // see below for better implementation!
  String.prototype.startsWith = (str) => this.indexOf(str) === 0;
}

exports.url = (req) => `${req.protocol}://${req.get('host')}`;

exports.sendSimpleMail = (mailOptions, done) => {
  const transporter = nodeMailer.createTransport({
    // host: 'smtp.gmail.com',
    // port: 587,
    // secure: false
    service: 'Gmail',
    auth: {
      user: 'developer.patoliya@gmail.com',
      pass: 'devpassword',
    },
  });

  // const transporter = nodeMailer.createTransport('smtps://zengrooming1@gmail.com:groom4Zen@smtp.gmail.com');
  transporter.sendMail(mailOptions, (error, info) => { /* eslint-disable-line no-unused-vars */
    if (error) {
      // return done(Boom.badRequest(error))
      console.log('mail send done');
    }
    return done();
  });
};
