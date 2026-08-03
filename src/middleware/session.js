import { findSessionWithUser } from '../db/queries/sessions.js';

const COOKIE_NAME = 'sid';

export async function sessionMiddleware(req, res, next) {
  const sessionId = req.signedCookies[COOKIE_NAME];
  req.user = null;

  if (sessionId) {
    const row = await findSessionWithUser(sessionId);
    if (row && new Date(row.session_expires_at).getTime() > Date.now()) {
      const { session_expires_at, password_hash, ...user } = row;
      req.user = user;
    } else {
      res.clearCookie(COOKIE_NAME);
    }
  }

  res.locals.user = req.user;
  next();
}
