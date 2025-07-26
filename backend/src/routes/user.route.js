import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protectRoute)
router.get('/',protectRoute, getRecommendedUsers);
router.get('/friends', protectRoute ,getMyFriends);

export default router;