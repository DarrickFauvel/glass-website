import { Resend } from 'resend';
import { config } from '../config.js';

const FROM_EMAIL = 'GLASS <noreply@sciencebasedskeptics.com>';

let resend;

function getResend() {
  if (!resend) {
    if (!config.resend.apiKey) {
      throw new Error('RESEND_API_KEY is not set — cannot send email.');
    }
    resend = new Resend(config.resend.apiKey);
  }
  return resend;
}

export async function sendVerificationEmail(to, token) {
  const link = `${config.baseUrl}/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verify your GLASS account',
    text: `Welcome to GLASS! Verify your email to finish creating your account:\n\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to GLASS! Verify your email to finish creating your account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${config.baseUrl}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Reset your GLASS password',
    text: `Reset your GLASS password:\n\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: `<p>Reset your GLASS password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  });
}
