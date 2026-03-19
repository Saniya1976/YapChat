import express from 'express';
import { signup, login, logout, onboard, verifyEmail, resendVerification } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/onboarding', protectRoute, onboard);

router.get('/me', protectRoute, (req, res) => {
  return res.status(200).json({ user: req.user });
});

export default router;