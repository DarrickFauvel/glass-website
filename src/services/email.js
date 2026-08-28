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

// Sent to self with everyone else bcc'd — one API call per event, and no recipient
// sees anyone else's address. Callers should skip calling this when recipients is empty.
export async function sendEventReminderEmail(recipients, event, dateLabel, timeLabel) {
  const accountLink = `${config.baseUrl}/account`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
  await getTransporter().sendMail({
    from: FROM_EMAIL,
    to: FROM_EMAIL,
    bcc: recipients,
    subject: `Reminder: GLASS meetup — ${dateLabel}`,
    text: `${event.title}\n\n${dateLabel} at ${timeLabel}\n${event.location}\n${mapsLink}\n\nHope to see you there!\n\nYou're receiving this because you opted into this reminder. Change which reminders you get at ${accountLink}.`,
    html: `<p><strong>${event.title}</strong></p><p>${dateLabel} at ${timeLabel}<br>${event.location}<br><a href="${mapsLink}">View on Google Maps</a></p><p>Hope to see you there!</p><p style="color:#666;font-size:0.9em;">You're receiving this because you opted into this reminder. Change which reminders you get at <a href="${accountLink}">${accountLink}</a>.</p>`,
  });
}
