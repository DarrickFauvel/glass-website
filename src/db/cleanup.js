import { getDb } from './client.js';

const UNVERIFIED_ACCOUNT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Purges data GDPR gives no reason to keep past its useful life: expired
// sessions/tokens, spent password-reset tokens, and accounts that never
// verified their email (so an abandoned signup doesn't hold an address forever).
export async function cleanupExpiredData() {
  const db = getDb();
  const now = new Date().toISOString();
  const staleSignupCutoff = new Date(Date.now() - UNVERIFIED_ACCOUNT_TTL_MS).toISOString();

  await db.execute({ sql: 'DELETE FROM sessions WHERE expires_at < ?', args: [now] });
  await db.execute({ sql: 'DELETE FROM email_verification_tokens WHERE expires_at < ?', args: [now] });
  await db.execute({
    sql: 'DELETE FROM password_reset_tokens WHERE expires_at < ? OR used_at IS NOT NULL',
    args: [now],
  });
  await db.execute({
    sql: 'DELETE FROM users WHERE email_verified = 0 AND created_at < ?',
    args: [staleSignupCutoff],
  });
}
