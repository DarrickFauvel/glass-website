import nodemailer from 'nodemailer';
import { config } from '../config.js';

const FROM_EMAIL = `GLASS <${config.smtp.fromEmail}>`;

let transporter;

function getTransporter() {
  if (!transporter) {
    if (!config.smtp.user || !config.smtp.pass) {
      throw new Error('SMTP_USER / SMTP_PASS are not set — cannot send email.');
    }
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(to, token) {
  const link = `${config.baseUrl}/verify-email?token=${token}`;
  await getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject: 'Verify your GLASS account',
    text: `Welcome to GLASS! Verify your email to finish creating your account:\n\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to GLASS! Verify your email to finish creating your account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${config.baseUrl}/reset-password?token=${token}`;
  await getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your GLASS password',
    text: `Reset your GLASS password:\n\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: `<p>Reset your GLASS password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  });
}
