import { Router } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
 const {email,password}=req.body;
 try {
  if(!email || !password){
    return res.status(400).json({message: 'Email and password are required'});
  }
  const user=await User.findOne({email});
  if(!user){
    return res.status(400).json({message: 'Invalid email or password'});
  }
  const isMatch=await user.comparePassword(password);
  if(!isMatch){
    return res.status(400).json({message: 'Invalid email or password'});
  }
  const token=jwt.sign({userId:user_id},process.env.JWT_SECRET,{expiresIn:'7d'});
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return res.status(200).json({message: 'Login successful', user});
 } catch (error) {
  console.error('Error during login:', error);
  return res.status(500).json({message: 'Internal server error'});
 }
}
export async function logout(req, res) {
  res.send('Logout Route');
}   