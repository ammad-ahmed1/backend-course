const express = require("express");
const { check, body } = require("express-validator");
// const authController = require("../controllers/auth");
const authController = require("../controllers/auth");
const router = express.Router();

// Signup (POST)
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        "Password must contain letters, numbers, and at least one special character"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  authController.postSignup
);

// Login (POST)
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        "Password must contain letters, numbers, and at least one special character"
      ),
  ],
  authController.postLogin
);

// Logout (POST)
router.post("/logout", authController.postLogout);

// Request password reset (POST)
router.post("/reset", authController.postReset);

// Set new password (POST)
router.post("/new-password", authController.postNewPassword);

module.exports = router;
