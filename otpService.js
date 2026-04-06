const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function sendOTP(email) {
  const otp = generateOTP();

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
    from: '"Your Name" <your_email@example.com>',
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`,
  });

  return otp;
}

module.exports = { sendOTP };