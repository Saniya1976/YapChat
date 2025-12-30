import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: 'Unauthorized, no token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ message: 'Unauthorized, token failed' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error("protectRoute error:", err);
    res.status(401).json({ message: 'Unauthorized, token failed' });
  }
};
