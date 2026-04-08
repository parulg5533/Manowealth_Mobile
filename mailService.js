const nodemailer = require("nodemailer");

async function notifyPsy(user, email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Manowealth – Wellness Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Urgent: Student Needs Your Attention – Manowealth",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#f9fafb;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#dc2626;padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">⚠️ Urgent Alert</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Manowealth – Student Wellness Platform · IIT Patna</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;color:#111827;font-size:15px;line-height:1.7;">
            A student named <strong>${user}</strong> has submitted an SOS alert and needs your urgent attention.
          </p>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
            Please log in to the Manowealth admin panel to review the alert and take appropriate action immediately.
          </p>
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            This is an automated alert from the Manowealth system. Please do not reply to this email.
          </p>
        </div>
        <div style="background:#f3f4f6;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">© 2025 Manowealth · IIT Patna</p>
        </div>
      </div>
    `,
    text: `URGENT: Student ${user} needs your help. Please log in to the Manowealth admin panel immediately.`,
  });

  return "sent";
}

module.exports = { notifyPsy };
