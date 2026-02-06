import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

const sendPasswordResetEmail = async ({ to, resetLink }) => {
  if (!fromEmail) {
    throw new Error("Missing FROM_EMAIL or SMTP_USER for sender");
  }
  if (!process.env.SMTP_HOST) {
    throw new Error("Missing SMTP_HOST");
  }

  const subject = "Reset your Tandoori Bites password";
  const text = `You requested a password reset. Use this link to set a new password: ${resetLink}`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${resetLink}">Click here to set a new password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  });
};

export { sendPasswordResetEmail };
