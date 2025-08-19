import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendRequests
} from '../controllers/user.controller.js';
// No additional code needed here; all imports are already present.
const router = express.Router();
router.use(protectRoute);

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);
router.post('/friend-request/:id', sendFriendRequest);
router.put('//friend-request/accept/:id', acceptFriendRequest);
router.get('/friend-requests', getFriendRequests);
router.get('/outgoing-friend-requests', getOutgoingFriendRequests);
export default router;