import { Router } from 'express';
import { startSSE, patchSignals, redirectClient } from '../middleware/datastar.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { verifyPassword } from '../services/auth.js';
import { findUserById, deleteUser } from '../db/queries/users.js';

const SESSION_COOKIE = 'sid';

export const accountRouter = Router();

accountRouter.get('/account', requireAuth, (req, res) => {
  res.render('account/index', { user: req.user });
});

// GDPR Art. 20 data portability — everything we hold on the account, as JSON.
accountRouter.get('/account/export', requireAuth, (req, res) => {
  const { id, email, display_name, email_verified, reminder_opt_in, privacy_consent_at, created_at } = req.user;
  res.setHeader('Content-Disposition', 'attachment; filename="glass-account-data.json"');
  res.json({
    id,
    email,
    displayName: display_name,
    emailVerified: Boolean(email_verified),
    reminderOptIn: Boolean(reminder_opt_in),
    privacyConsentAt: privacy_consent_at,
    accountCreatedAt: created_at,
  });
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
