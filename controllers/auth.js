const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  const cookieHeader = req.get("Cookie");
  let isLoggedIn = false;

  if (cookieHeader) {
    isLoggedIn = cookieHeader?.split(";")[1]?.trim()?.split("=")[1];
  }
  console.log(isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("689e6030f5c81aea57d122c5")
    .then((user) => {
      console.log(user), ">...........sususe";
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect("/shop/products");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
