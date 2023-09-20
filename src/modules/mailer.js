const nodemailer = require('nodemailer');
require('dotenv').config();

var transport = nodemailer.createTransport({
  service: 'smtp.protomail.com',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
});

module.exports = transport;
