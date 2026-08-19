export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  if (!req.user.is_admin) {
    return res.status(403).send('Forbidden');
  }
  next();
}
