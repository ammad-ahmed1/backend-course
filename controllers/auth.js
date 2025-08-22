const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../utils/transporter");
const { validationResult } = require("express-validator");

// GET signup
exports.getSignup = (req, res, next) => {
  res.status(200).render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn,
    oldInput: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });
};

// POST signup
exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitles: "Signup",
      errorMessage: errors.array(),
      oldInput: {
        email: email,
        name: name,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }
  if (password !== confirmPassword) {
    console.log("Passwords mismatch!");
    return res.status(400).redirect("/signup");
  }

  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        console.error("User already exists!");
        return res.status(409).redirect("/signup");
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      if (!hashedPassword) return;

      return transporter
        .sendMail({
          to: email,
          from: "iammadmughal480@gmail.com",
          subject: "Signup succeeded!",
          html: `<!DOCTYPE html> <html> <head> <meta charset="UTF-8" /> <title>Signup Confirmation</title> </head> <body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;"> <div style=" max-width: 500px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); " > <h2 style="color: #4f46e5; margin-bottom: 15px;">🎉 Welcome!</h2> <p style="color: #333; margin: 10px 0;">Hi ${name},</p> <p style="color: #333; margin: 10px 0;"> Your account has been created successfully. </p> <a href="http://localhost:3000/login" style=" display: inline-block; margin-top: 15px; padding: 10px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; " > Login Now </a> <p style="margin-top: 20px; font-size: 12px; color: #888;"> If you didn’t sign up, ignore this email. </p> </div> </body> </html>`,
        })
        .then(() => {
          const user = new User({
            name,
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((savedUser) => {
          if (savedUser) {
            console.log("User saved & email sent!");
            res.status(201).redirect("/login"); // 201 Created
          }
        })
        .catch((error) => {
          console.log("Email sending failed!", error);
          res.status(500).redirect("/signup"); // email fail
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect("/500");
    });
};

// GET login
exports.getLogin = (req, res, next) => {
  res.status(200).render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
    },
  });
};

// POST login
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array(),
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        console.log("Wrong email!");
        req.flash("error-email", "Invalid email! or password");
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: [{ msg: "Invalid email or password!" }],
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              if (err) console.log(err);
              console.log("Logged in successfully");
              res.status(200).redirect("/shop/products");
            });
          }
          console.log("Invalid Password!");
          req.flash("error-password", "Invalid password!");
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: [{ msg: "Invalid email or password!" }],
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect("/500");
    });
};

// POST logout
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.status(302).redirect("/login");
  });
};

// GET reset
exports.getReset = (req, res, next) => {
  res.status(200).render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
  });
};

// POST reset
exports.postReset = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.status(500).redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          console.log("Email doesn't exist!");
          req.flash("error-email", "Invalid email!");
          return res.status(404).redirect("/reset"); // Not Found
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1h expiry
        return user.save();
      })
      .then((result) => {
        if (!result) return;

        res.status(302).redirect("/login");

        return transporter.sendMail({
          to: email,
          from: "iammadmughal480@gmail.com",
          subject: "Password Reset",
          html: `<!DOCTYPE html> <html> <head> <meta charset="UTF-8" /> <title>Password Reset</title> </head> <body style="font-family: Arial, sans-serif; background:#f9f9f9; margin:0; padding:0;"> <div style=" max-width:500px; margin:40px auto; background:#ffffff; padding:20px; border-radius:8px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.1); "> <h2 style="color:#4f46e5; margin-bottom:15px;">🔑 Password Reset</h2> <p style="color:#333; margin:10px 0;">Hi ${email},</p> <p style="color:#333; margin:10px 0;"> You requested to reset your password. Click the button below to set a new one: </p> <a href="http://localhost:3000/reset/${token}" style=" display:inline-block; margin-top:15px; padding:10px 20px; background:#4f46e5; color:#ffffff; text-decoration:none; border-radius:5px; "> Reset Password </a> <p style="margin-top:20px; font-size:12px; color:#888;"> If you didn’t request this, you can safely ignore this email. </p> </div> </body> </html>`,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).redirect("/500");
      });
  });
};

// GET new password
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).redirect("/reset");
      }
      res.status(200).render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect("/500");
    });
};

// POST new password
exports.postNewPassword = (req, res, next) => {
  const {
    password: newPassword,
    confirmPassword,
    passwordToken,
    userId,
  } = req.body;
  let resetUser;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match!");
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) return res.status(404).redirect("/reset");
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.status(200).redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect("/500");
    });
};
