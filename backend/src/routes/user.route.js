import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getOutgoingFriendRequests
} from '../controllers/user.controller.js';
const router = express.Router();
router.use(protectRoute);

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);
router.post('/friend-request/:id', sendFriendRequest);
router.put('/friend-request/accept/:id', acceptFriendRequest);
router.put('/friend-request/reject/:id', rejectFriendRequest);
router.get('/friend-requests', getFriendRequests);
router.get('/outgoing-friend-requests', getOutgoingFriendRequests);
export default router;