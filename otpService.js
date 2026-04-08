const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function sendOTP(email) {
  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Manowealth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Password Reset – Manowealth",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#2563eb;padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Manowealth</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Student Wellness Platform · IIT Patna</p>
        </div>
        <div style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Password Reset OTP</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
            Use the code below to reset your password. This OTP is valid for <strong>10 minutes</strong>.
          </p>
          <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1d4ed8;">${otp}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
            If you did not request a password reset, please ignore this email. Your account is safe.<br/>
            Do not share this OTP with anyone.
          </p>
        </div>
        <div style="background:#f3f4f6;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">© 2025 Manowealth · IIT Patna</p>
        </div>
      </div>
    `,
    text: `Your Manowealth password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
  });

  return otp;
}

module.exports = { sendOTP };
