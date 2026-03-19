
import crypto from 'crypto';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';
import FriendRequest from '../models/FriendRequest.js';
import { sendVerificationEmail } from '../lib/email.js';

/* ─── helpers ─────────────────────────────────────────────────────────── */

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function issueSessionCookie(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/* ─── signup ───────────────────────────────────────────────────────────── */

export async function signup(req, res) {
  const { fullName, email, password } = req.body;
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate email-verification token (expires in 24 hours)
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      profilePic: randomAvatar,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    // Upsert into Stream (best-effort)
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || '',
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (err) {
      console.error('Error creating/updating Stream user:', err);
    }

    // Send verification email (best-effort — don't block signup if it fails)
    try {
      await sendVerificationEmail(normalizedEmail, verificationToken, fullName);
      console.log(`Verification email sent to ${normalizedEmail}`);
    } catch (err) {
      console.error('Error sending verification email:', err);
    }

    return res.status(201).json({
      message: 'Account created! Please check your email to verify your address before logging in.',
      emailSent: true,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─── verify email ─────────────────────────────────────────────────────── */

export async function verifyEmail(req, res) {
  const { token } = req.params;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification link. Please sign up again or request a new link.',
      });
    }

    // Mark verified and clear token fields
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Issue session cookie so the user is logged in immediately after verifying
    issueSessionCookie(res, user._id);

    console.log(`Email verified for ${user.email}`);
    return res.status(200).json({ message: 'Email verified successfully! You are now logged in.', user });
  } catch (error) {
    console.error('Error during email verification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─── login ────────────────────────────────────────────────────────────── */

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login attempt failed: Incorrect password for email ${normalizedEmail}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Block login for unverified accounts
    if (!user.isVerified) {
      console.log(`Login blocked: email not verified for ${normalizedEmail}`);
      return res.status(403).json({
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        unverified: true,
      });
    }

    console.log(`Login successful for user: ${normalizedEmail}`);
    issueSessionCookie(res, user._id);

    return res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─── logout ───────────────────────────────────────────────────────────── */

export async function logout(req, res) {
  try {
    res.clearCookie('jwt');
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─── onboard ──────────────────────────────────────────────────────────── */

export async function onboard(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    if ([fullName, bio, nativeLanguage, learningLanguage, location].some((f) => !f)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic: profilePic || undefined,
        isOnboarded: true,
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || '',
    });

    return res.status(200).json({ message: 'User onboarded successfully', user: updatedUser });
  } catch (error) {
    console.error('Error during onboarding:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─── resend verification email ────────────────────────────────────────── */

export async function resendVerification(req, res) {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond generically to prevent email enumeration
    if (!user || user.isVerified) {
      return res.status(200).json({
        message: 'If an unverified account exists with that email, a new link has been sent.',
      });
    }

    // Generate fresh token (expires in 24 hours)
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(normalizedEmail, verificationToken, user.fullName);
    } catch (err) {
      console.error('Error resending verification email:', err);
    }

    return res.status(200).json({
      message: 'If an unverified account exists with that email, a new link has been sent.',
    });
  } catch (error) {
    console.error('Error during resend verification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}