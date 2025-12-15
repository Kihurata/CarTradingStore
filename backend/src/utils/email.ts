// src/utils/email.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
export async function sendResetEmail(email: string, token: string): Promise<void> {
  const transporter = createTransporter();
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Password - Autorizz',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Token expires in 1h.</p>`,
  });
}