import { Router } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';


export async function signup(req, res) {
 const {fullName,email,password} = req.body;
 try {
  if(!email||!password||!fullName){
    return res.status(400).json({message: 'All fields are required'});
  }
  if(password.length<6){
    return res.status(400).json({message: 'Password must be at least 6 characters long'});
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    return res.status(400).json({message: 'Invalid email format'});
  }
  const existingUser=await User.findOne({email});
  if(existingUser){
    return res.status(400).json({message:'Email already exists'});
  }
  const idx=Math.floor(Math.random() * 100)+1;
  const randomAvatar=`https://avatar.iran.liara.run/public/${idx}.png`;
  const newUser=await User.create({
    fullName,
    email,
    password,
    profilePic: randomAvatar
  })
 try {
   await upsertStreamUser({
    id:newUser._id.toString(),
    name:newUser.fullName,
    image:newUser.profilePic || ""
  })
  console.log(`stream user created for ${newUser.fullName}`)
 } catch (error) {
   console.error('Error creating/updating Stream user:', error);
 }


  const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.status(201).json({message: 'User created successfully', user: newUser});
 } catch (error) {
  console.error('Error during signup:', error);
   return res.status(500).json({message: 'Internal server error'});
 }
}
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fixed: Make cookie settings consistent with signup
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: 'strict',  // Changed from conditional to 'strict'
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
    return res.status(200).json({message: 'Logout successful'});
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({message: 'Internal server error'});
    
  }
} 

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: 'All fields are required',
        missingFields: [
          !fullName && 'fullName',
          !bio && 'bio',
          !nativeLanguage && 'nativeLanguage',
          !learningLanguage && 'learningLanguage',
          !location && 'location'
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        isOnboarded: true
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: "https://avatar.iran.liara.run/public/30.png"
    });

    return res.status(200).json({ message: 'User onboarded successfully', user: updatedUser });
  } catch (error) {
    console.error('Error during onboarding:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
