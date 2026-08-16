import { Router } from 'express';
import { startSSE, patchSignals, redirectClient } from '../middleware/datastar.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { hashPassword, verifyPassword } from '../services/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { createUser, findUserByEmail, markEmailVerified, updatePassword } from '../db/queries/users.js';
import { createSession, deleteSession } from '../db/queries/sessions.js';
import {
  createVerificationToken,
  consumeVerificationToken,
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
} from '../db/queries/tokens.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_COOKIE = 'sid';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const authRouter = Router();

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

authRouter.get('/register', (req, res) => {
  res.render('auth/register', { sentEmail: req.query.sent ?? null });
});

authRouter.post('/register', async (req, res) => {
  const { name, displayName, email, password, confirmPassword, consent, reminderOptIn } = req.body.register ?? {};
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name ?? '').trim();
  const cleanDisplayName = String(displayName ?? '').trim();

  let error;
  if (!cleanName) error = 'Please enter your name.';
  else if (!cleanDisplayName) error = 'Please enter a display name.';
  else if (!EMAIL_RE.test(cleanEmail)) error = 'Please enter a valid email address.';
  else if (!password || password.length < 8) error = 'Password must be at least 8 characters.';
  else if (password !== confirmPassword) error = 'Passwords do not match.';
  else if (!consent) error = 'You must agree to the Privacy Policy to create an account.';

  if (!error && (await findUserByEmail(cleanEmail))) {
    error = 'An account with that email already exists.';
  }

  if (error) {
    startSSE(res);
    patchSignals(res, { register: { submitting: false, error } });
    return res.end();
  }

  const passwordHash = await hashPassword(password);
  const userId = await createUser({
    email: cleanEmail,
    passwordHash,
    name: cleanName,
    displayName: cleanDisplayName,
    reminderOptIn: Boolean(reminderOptIn),
    consentAt: new Date().toISOString(),
  });
  const token = await createVerificationToken(userId);
  await sendVerificationEmail(cleanEmail, token).catch((err) => {
    console.error('Failed to send verification email:', err);
  });

  startSSE(res);
  redirectClient(res, `/register?sent=${encodeURIComponent(cleanEmail)}`);
  res.end();
});

authRouter.get('/verify-email', async (req, res) => {
  const row = await consumeVerificationToken(String(req.query.token ?? ''));
  if (!row) {
    return res.render('auth/verify-email', { success: false });
  }
  await markEmailVerified(row.user_id);
  res.render('auth/verify-email', { success: true });
});

authRouter.get('/login', (req, res) => {
  res.render('auth/login');
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body.login ?? {};
  const cleanEmail = normalizeEmail(email);

  const user = await findUserByEmail(cleanEmail);
  const valid = user && (await verifyPassword(user.password_hash, password ?? ''));

  if (!valid) {
    startSSE(res);
    patchSignals(res, { login: { submitting: false, error: 'Invalid email or password.' } });
    return res.end();
  }

  const sessionId = await createSession(user.id);
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: req.app.get('env') === 'production',
    sameSite: 'lax',
    signed: true,
    maxAge: SESSION_MAX_AGE_MS,
  });

  // /profile lands in Milestone 3 — redirect home until it exists.
  startSSE(res);
  redirectClient(res, '/');
  res.end();
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  const sessionId = req.signedCookies[SESSION_COOKIE];
  if (sessionId) await deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE);
  res.redirect(303, '/');
});

authRouter.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', { sent: req.query.sent === '1' });
});

authRouter.post('/forgot-password', async (req, res) => {
  const cleanEmail = normalizeEmail(req.body.forgotPassword?.email);
  const user = await findUserByEmail(cleanEmail);
  if (user) {
    const token = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(cleanEmail, token).catch((err) => {
      console.error('Failed to send password reset email:', err);
    });
  }
  startSSE(res);
  redirectClient(res, '/forgot-password?sent=1');
  res.end();
});

authRouter.get('/reset-password', async (req, res) => {
  const token = String(req.query.token ?? '');
  const row = await findPasswordResetToken(token);
  const tokenValid = Boolean(row && !row.used_at && new Date(row.expires_at).getTime() > Date.now());
  res.render('auth/reset-password', { tokenValid, token });
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body.resetPassword ?? {};
  const row = await findPasswordResetToken(String(token ?? ''));
  const tokenValid = Boolean(row && !row.used_at && new Date(row.expires_at).getTime() > Date.now());

  let error;
  if (!tokenValid) error = 'This reset link is invalid or has expired.';
  else if (!password || password.length < 8) error = 'Password must be at least 8 characters.';
  else if (password !== confirmPassword) error = 'Passwords do not match.';

  if (error) {
    startSSE(res);
    patchSignals(res, { resetPassword: { submitting: false, error } });
    return res.end();
  }

  const passwordHash = await hashPassword(password);
  await updatePassword(row.user_id, passwordHash);
  await markPasswordResetTokenUsed(row.token);

  startSSE(res);
  redirectClient(res, '/login');
  res.end();
});
