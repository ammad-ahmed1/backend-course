module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect(401, "/login");
  }
  next();
};
