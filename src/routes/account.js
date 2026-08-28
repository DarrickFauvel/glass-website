import { Router } from 'express';
import { startSSE, patchSignals, patchElements, redirectClient } from '../middleware/datastar.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { hashPassword, verifyPassword } from '../services/auth.js';
import { eta } from '../eta.js';
import {
  findUserById,
  findUserByEmail,
  deleteUser,
  updateName,
  updateDisplayName,
  updateEmail,
  updatePassword,
  updateAvatarColor,
} from '../db/queries/users.js';
import { getUserReminderOffsets, setUserReminderOffsets } from '../db/queries/reminderOffsets.js';
import { createReminderConfirmationToken, createVerificationToken } from '../db/queries/tokens.js';
import { sendReminderConfirmationEmail, sendVerificationEmail } from '../services/email.js';
import { REMINDER_OFFSET_OPTIONS } from '../lib/reminderOffsets.js';

const SESSION_COOKIE = 'sid';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export const accountRouter = Router();

accountRouter.get('/account', requireAuth, async (req, res) => {
  const selectedOffsets = await getUserReminderOffsets(req.user.id);
  const reminderPrefsSignal = {
    saved: false,
    resent: false,
    pendingConfirmation: selectedOffsets.length > 0 && !req.user.reminder_confirmed_at,
    confirmed: selectedOffsets.length > 0 && Boolean(req.user.reminder_confirmed_at),
  };
  for (const option of REMINDER_OFFSET_OPTIONS) {
    reminderPrefsSignal[`d${option.days}`] = selectedOffsets.includes(option.days);
  }

  res.render('account/index', {
    user: req.user,
    offsetOptions: REMINDER_OFFSET_OPTIONS,
    reminderPrefsSignalsJson: JSON.stringify({ reminderPrefs: reminderPrefsSignal }),
  });
});

// GDPR Art. 20 data portability — everything we hold on the account, as JSON.
accountRouter.get('/account/export', requireAuth, async (req, res) => {
  const { id, email, name, display_name, email_verified, reminder_confirmed_at, privacy_consent_at, created_at } =
    req.user;
  const reminderOffsetDays = await getUserReminderOffsets(req.user.id);
  res.setHeader('Content-Disposition', 'attachment; filename="glass-account-data.json"');
  res.json({
    id,
    email,
    name,
    displayName: display_name,
    emailVerified: Boolean(email_verified),
    reminderOffsetDays,
    reminderConfirmedAt: reminder_confirmed_at,
    privacyConsentAt: privacy_consent_at,
    accountCreatedAt: created_at,
  });
});

accountRouter.post('/account/name', requireAuth, async (req, res) => {
  const name = String(req.body.accountName?.value ?? '').trim();

  if (!name) {
    startSSE(res);
    patchSignals(res, { accountName: { submitting: false, error: 'Please enter a name.' } });
    return res.end();
  }

  await updateName(req.user.id, name);

  startSSE(res);
  patchSignals(res, { accountName: { value: name, editing: false, submitting: false, error: '' } });
  res.end();
});

accountRouter.post('/account/display-name', requireAuth, async (req, res) => {
  const displayName = String(req.body.profileName?.value ?? '').trim();

  if (!displayName) {
    startSSE(res);
    patchSignals(res, { profileName: { submitting: false, error: 'Please enter a name.' } });
    return res.end();
  }

  await updateDisplayName(req.user.id, displayName);

  startSSE(res);
  patchSignals(res, { profileName: { value: displayName, editing: false, submitting: false, error: '' } });
  res.end();
});

const AVATAR_TINT_COUNT = 6;

accountRouter.post('/account/avatar-color/:index', requireAuth, async (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= AVATAR_TINT_COUNT) {
    return res.status(400).send('Invalid avatar color.');
  }

  await updateAvatarColor(req.user.id, index);

  const navAvatarHtml = eta.render('partials/avatar', {
    displayName: req.user.display_name,
    userId: req.user.id,
    avatarColor: index,
    size: 'sm',
    id: 'avatar-nav',
  });
  const accountAvatarHtml = eta.render('partials/avatar', {
    displayName: req.user.display_name,
    userId: req.user.id,
    avatarColor: index,
    size: 'lg',
    id: 'avatar-account-header',
  });

  startSSE(res);
  patchElements(res, navAvatarHtml, { selector: '#avatar-nav', mode: 'outer' });
  patchElements(res, accountAvatarHtml, { selector: '#avatar-account-header', mode: 'outer' });
  res.end();
});

accountRouter.post('/account/email', requireAuth, async (req, res) => {
  const { newEmail, password } = req.body.changeEmail ?? {};
  const cleanEmail = normalizeEmail(newEmail);
  const fullUser = await findUserById(req.user.id);
  const valid = fullUser && (await verifyPassword(fullUser.password_hash, password ?? ''));

  let error;
  if (!valid) error = 'Current password is incorrect.';
  else if (!EMAIL_RE.test(cleanEmail)) error = 'Please enter a valid email address.';
  else if (cleanEmail === req.user.email) error = 'That is already your email address.';
  else if (await findUserByEmail(cleanEmail)) error = 'An account with that email already exists.';

  if (error) {
    startSSE(res);
    patchSignals(res, { changeEmail: { submitting: false, error } });
    return res.end();
  }

  await updateEmail(req.user.id, cleanEmail);
  const token = await createVerificationToken(req.user.id);
  await sendVerificationEmail(cleanEmail, token).catch((err) => {
    console.error('Failed to send verification email:', err);
  });

  // Several server-rendered elements (verified badge, unverified notice, the
  // reminder-confirmation copy that quotes the email) depend on the email —
  // reload rather than trying to patch them all individually client-side.
  startSSE(res);
  redirectClient(res, '/account');
  res.end();
});

accountRouter.post('/account/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body.changePassword ?? {};
  const fullUser = await findUserById(req.user.id);
  const valid = fullUser && (await verifyPassword(fullUser.password_hash, currentPassword ?? ''));

  let error;
  if (!valid) error = 'Current password is incorrect.';
  else if (!newPassword || newPassword.length < 8) error = 'New password must be at least 8 characters.';
  else if (newPassword !== confirmPassword) error = 'Passwords do not match.';

  if (error) {
    startSSE(res);
    patchSignals(res, { changePassword: { submitting: false, error, success: false } });
    return res.end();
  }

  const passwordHash = await hashPassword(newPassword);
  await updatePassword(fullUser.id, passwordHash);

  startSSE(res);
  patchSignals(res, {
    changePassword: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      submitting: false,
      error: '',
      success: true,
    },
  });
  res.end();
});

accountRouter.post('/account/reminder-preferences', requireAuth, async (req, res) => {
  const prefs = req.body.reminderPrefs ?? {};
  const offsetDays = REMINDER_OFFSET_OPTIONS.filter((option) => Boolean(prefs[`d${option.days}`])).map(
    (option) => option.days,
  );

  const previousOffsets = await getUserReminderOffsets(req.user.id);
  await setUserReminderOffsets(req.user.id, offsetDays);

  // Double opt-in: going from no reminders to at least one only counts as a fresh
  // subscription (worth a confirmation email) the first time — a member who's
  // already confirmed can freely add/remove timings without re-confirming.
  const isFreshOptIn = offsetDays.length > 0 && previousOffsets.length === 0 && !req.user.reminder_confirmed_at;
  if (isFreshOptIn) {
    const token = await createReminderConfirmationToken(req.user.id);
    await sendReminderConfirmationEmail(req.user.email, token).catch((err) => {
      console.error('Failed to send reminder confirmation email:', err);
    });
  }

  startSSE(res);
  patchSignals(res, {
    reminderPrefs: {
      saved: true,
      pendingConfirmation: offsetDays.length > 0 && !req.user.reminder_confirmed_at,
      confirmed: offsetDays.length > 0 && Boolean(req.user.reminder_confirmed_at),
    },
  });
  res.end();
});

accountRouter.post('/account/resend-reminder-confirmation', requireAuth, async (req, res) => {
  const token = await createReminderConfirmationToken(req.user.id);
  await sendReminderConfirmationEmail(req.user.email, token).catch((err) => {
    console.error('Failed to send reminder confirmation email:', err);
  });

  startSSE(res);
  patchSignals(res, { reminderPrefs: { resent: true } });
  res.end();
});

accountRouter.post('/account/resend-verification', requireAuth, async (req, res) => {
  const token = await createVerificationToken(req.user.id);
  await sendVerificationEmail(req.user.email, token).catch((err) => {
    console.error('Failed to send verification email:', err);
  });

  startSSE(res);
  patchSignals(res, { emailVerify: { resent: true } });
  res.end();
});

// GDPR Art. 17 right to erasure — password-gated since this is irreversible.
accountRouter.post('/account/delete', requireAuth, async (req, res) => {
  const { password } = req.body.deleteAccount ?? {};
  const fullUser = await findUserById(req.user.id);
  const valid = fullUser && (await verifyPassword(fullUser.password_hash, password ?? ''));

  if (!valid) {
    startSSE(res);
    patchSignals(res, { deleteAccount: { submitting: false, error: 'Incorrect password.' } });
    return res.end();
  }

  await deleteUser(req.user.id);
  res.clearCookie(SESSION_COOKIE);

  startSSE(res);
  redirectClient(res, '/');
  res.end();
});
