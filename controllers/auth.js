const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/transporter");
const { validationResult } = require("express-validator");

// POST signup
exports.postSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation failed",
        success: false,
        errors: errors.array(),
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      cart: { items: [] },
    });

    await user.save();

    // Send welcome email
    await transporter.sendMail({
      to: email,
      from: "iammadmughal480@gmail.com",
      subject: "Signup succeeded!",
      html: `<p>Hi ${name}, your account has been created successfully. You can now log in.</p>`,
    });

    res.status(201).json({
      message: "User created successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// POST login
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Validation failed",
        success: false,
        errors: errors.array(),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not found!",
        success: false,
      });
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "supersecretkey", // 👉 isko .env me daalo
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      userId: user._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// POST logout (frontend JWT mein handle karega)
exports.postLogout = (req, res) => {
  res.status(200).json({
    message: "Logout successful (just delete token on client)",
    success: true,
  });
};

// POST reset password (request reset link)
exports.postReset = async (req, res) => {
  try {
    const { email } = req.body;
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No account with this email found",
        success: false,
      });
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1h
    await user.save();

    await transporter.sendMail({
      to: email,
      from: "iammadmughal480@gmail.com",
      subject: "Password Reset",
      html: `<p>You requested a password reset</p>
             <p>Click this <a href="http://localhost:3000/reset/${token}/${user._id}">link</a> to set a new password.</p>`,
    });

    res.status(200).json({
      message: "Password reset email sent",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// POST new password
exports.postNewPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token, userId } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        success: false,
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
