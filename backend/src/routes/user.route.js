import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware';
import {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest
} from '../controllers/user.controller.js';

const router = express.Router();

router.use(protectRoute)
router.get('/',protectRoute, getRecommendedUsers);
router.get('/friends', protectRoute ,getMyFriends);
router.post('/friend-request/:id',protectRoute,sendFriendRequest);
router.put('/friend-request/:id/accept',protectRoute,acceptFriendRequest);

export default router;