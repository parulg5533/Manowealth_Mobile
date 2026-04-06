const nodemailer = require("nodemailer");

async function notifyPsy(user ,email) {

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "weldon32@ethereal.email",
      pass: "X9z8MgvHTHmjudkaWn",
    },
  });

  let info = await transporter.sendMail({
    from: '"super admin" harsh@gmail.com',
    to: email,
    subject: "need urgent help",
    text: `${user} needs your urgent help`,
  });

 return 'sent'
}

module.exports = { notifyPsy };