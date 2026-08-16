import { Router } from 'express';
import { startSSE, patchSignals, redirectClient } from '../middleware/datastar.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { hashPassword, verifyPassword } from '../services/auth.js';
import {
  findUserById,
  deleteUser,
  updateReminderOptIn,
  updateName,
  updateDisplayName,
  updatePassword,
} from '../db/queries/users.js';

const SESSION_COOKIE = 'sid';

export const accountRouter = Router();

accountRouter.get('/account', requireAuth, (req, res) => {
  res.render('account/index', { user: req.user });
});

// GDPR Art. 20 data portability — everything we hold on the account, as JSON.
accountRouter.get('/account/export', requireAuth, (req, res) => {
  const { id, email, name, display_name, email_verified, reminder_opt_in, privacy_consent_at, created_at } = req.user;
  res.setHeader('Content-Disposition', 'attachment; filename="glass-account-data.json"');
  res.json({
    id,
    email,
    name,
    displayName: display_name,
    emailVerified: Boolean(email_verified),
    reminderOptIn: Boolean(reminder_opt_in),
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

accountRouter.post('/account/reminder-preference', requireAuth, async (req, res) => {
  const optIn = Boolean(req.body.reminderPref?.value);
  await updateReminderOptIn(req.user.id, optIn);

  startSSE(res);
  patchSignals(res, { reminderPref: { saved: true } });
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
