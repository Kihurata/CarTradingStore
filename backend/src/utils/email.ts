// src/utils/email.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({ 
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER || process.env.EMAIL_USER, pass: process.env.SMTP_PASS || process.env.EMAIL_PASS },
});

export async function sendResetEmail(email: string, token: string): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to: email,
    subject: 'Yêu cầu đặt lại mật khẩu',
    html: `
      <h3>Yêu cầu đặt lại mật khẩu</h3>
      <p>Bấm vào link dưới đây để đặt lại mật khẩu (Hết hạn sau 1 giờ):</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  });
}