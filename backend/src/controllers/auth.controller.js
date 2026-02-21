
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';
import FriendRequest from '../models/FriendRequest.js';

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

    // Using DiceBear for faster and more reliable avatars
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;

    const newUser = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      profilePic: randomAvatar
    })
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || ""
      })
      console.log(`stream user created for ${newUser.fullName}`)
    } catch (error) {
      console.error('Error creating/updating Stream user:', error);
    }


    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login attempt failed: Incorrect password for email ${normalizedEmail}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log(`Login successful for user: ${normalizedEmail}`);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fixed: Make cookie settings consistent with signup
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: 'lax',  // Changed from 'strict' to 'lax'
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
      user
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function logout(req, res) {
  try {
    res.clearCookie('jwt');
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error' });

  }
}

export async function onboard(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    if ([fullName, bio, nativeLanguage, learningLanguage, location].some(f => !f)) {
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
        isOnboarded: true
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || ""
    });

    return res.status(200).json({
      message: 'User onboarded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error during onboarding:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}