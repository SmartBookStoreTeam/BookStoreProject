import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

import sendEmail from "../utils/sendEmail.js";
import loadEmailTemplate from "../utils/emailTemplate.js";

// -----------------------------------------
// POST /api/auth/register
// -----------------------------------------
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000,
    });

    const html = loadEmailTemplate("verifyEmail", {
      CODE: verificationCode,
      YEAR: new Date().getFullYear(),
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html,
    });

    res.status(201).json({
      message: "Registration successful. Verification code sent to email.",
    });
  } catch (error) {
    next(error);
  }
};

// Verfiy The Code
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code, 
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    res.json({
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------
// POST /api/auth/login
// -----------------------------------------
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // can't login before verify
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    // Check if user registered with Google
    if (user.googleId && !user.password) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------
// POST /api/auth/google
// Google OAuth Login/Register
// -----------------------------------------
export const googleAuth = async (req, res, next) => {
  try {
    const { token, user: googleUser } = req.body;

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ message: "Invalid Google user data" });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // User exists - link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleUser.sub;
        user.avatar = googleUser.picture || user.avatar;
        await user.save();
      }
    } else {
      // Create new user with Google data
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        avatar: googleUser.picture,
        // No password needed for Google OAuth users
      });
    }

    // Return user + token
    res.json({
      message: "Google authentication successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------
// GET /api/auth/me
// Protected route
// -----------------------------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
