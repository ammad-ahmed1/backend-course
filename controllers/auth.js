const User = require("../models/user");
const bcrypt = require("bcryptjs");

const crypto = require("crypto");
const transporter = require("../utils/transporter");

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password !== confirmPassword) {
    console.log("Passwords mismatch!");
    return res.redirect("/signup");
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        console.error("User already exists!");
        return res.redirect("/signup");
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
          html: `
          <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Signup Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
    <div
      style="
        max-width: 500px;
        margin: 40px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <h2 style="color: #4f46e5; margin-bottom: 15px;">🎉 Welcome!</h2>

      <p style="color: #333; margin: 10px 0;">Hi ${name},</p>
      <p style="color: #333; margin: 10px 0;">
        Your account has been created successfully.
      </p>

      <a
        href="http://localhost:3000/login"
        style="
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          background: #4f46e5;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
        "
      >
        Login Now
      </a>

      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        If you didn’t sign up, ignore this email.
      </p>
    </div>
  </body>
</html>

        `,
        })
        .then(() => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((savedUser) => {
          if (savedUser) {
            console.log("User saved & email sent!");
            res.redirect("/login");
          }
        })
        .catch((error) => {
          console.log("Email sending failed!", error);
          res.redirect("/signup"); // email fail → user save nahi hoga
        });
    })
    .catch((error) => console.log(error));
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        console.log("Wrong email!");
        req.flash("error-email", "Invalid email!");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              console.log("Logged in successfuly");
              res.redirect("/shop/products");
            });
          }
          console.log("Invalid Password!");
          req.flash("error-password", "Invalid password!");
          res.redirect("/login");
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          console.log("Email doesn't exist!");
          req.flash("error-email", "Invalid email!");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiry
        return user.save();
      })
      .then((result) => {
        if (!result) return; // if user not found, stop here

        res.redirect("/login");

        return transporter.sendMail({
          to: email,
          from: "iammadmughal480@gmail.com", // must be verified with SendGrid
          subject: "Password Reset",
          html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <title>Password Reset</title>
            </head>
            <body style="font-family: Arial, sans-serif; background:#f9f9f9; margin:0; padding:0;">
              <div style="
                max-width:500px; 
                margin:40px auto; 
                background:#ffffff; 
                padding:20px; 
                border-radius:8px; 
                text-align:center; 
                box-shadow:0 2px 8px rgba(0,0,0,0.1);
              ">
                <h2 style="color:#4f46e5; margin-bottom:15px;">🔑 Password Reset</h2>

                <p style="color:#333; margin:10px 0;">Hi ${email},</p>
                <p style="color:#333; margin:10px 0;">
                  You requested to reset your password. Click the button below to set a new one:
                </p>

                <a href="http://localhost:3000/reset/${token}" 
                  style="
                    display:inline-block; 
                    margin-top:15px; 
                    padding:10px 20px; 
                    background:#4f46e5; 
                    color:#ffffff; 
                    text-decoration:none; 
                    border-radius:5px;
                  ">
                  Reset Password
                </a>

                <p style="margin-top:20px; font-size:12px; color:#888;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((error) => console.log(error));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const passwordToken = req.body.passwordToken;
  const userId = req.body.userId;
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
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
