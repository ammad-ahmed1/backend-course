const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: "",
    },
  })
);

module.exports = transporter;
