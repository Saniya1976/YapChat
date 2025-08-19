import { Router } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';
import FriendRequest from '../models/FriendRequest.js';

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({   
            $and: [
                { _id: { $ne: currentUserId } },
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        })
        .select('-password -__v')
        .limit(10)
        .lean();

        const outgoingRequests = await FriendRequest.find({
            sender: currentUserId,
            status: 'pending'
        }).select('recipient');

        const outgoingSet = new Set(outgoingRequests.map(r => r.recipient.toString()));

        const finalUsers = recommendedUsers.map(u => ({
            ...u,
            requestSent: outgoingSet.has(u._id.toString())
        }));

        return res.status(200).json({ recommendedUsers: finalUsers });
    } catch (error) {
        console.error('Error fetching recommended users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user._id)
            .select('friends')
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");
        return res.status(200).json({ friends: user.friends });
    } catch (error) {
        console.error('Error fetching friends:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user._id;
        const { id: recipientId } = req.params; 

        console.log("Friend request attempt:", { from: myId, to: recipientId });

        // Prevent sending friend request to self
        if (myId.toString() === recipientId) {
            return res.status(400).json({ 
                message: 'You cannot send a friend request to yourself',
                code: 'SELF_REQUEST',
                userId: recipientId
            });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ 
                message: 'Recipient not found',
                code: 'USER_NOT_FOUND',
                userId: recipientId
            });
        }

        // Check if already friends
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ 
                message: 'You are already friends with this user',
                code: 'ALREADY_FRIENDS',
                userId: recipientId
            });
        }

        // Check if friend request already exists (any status)
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
        });

        if (existingRequest) {
            // If there's a rejected request, allow creating a new one
            if (existingRequest.status === 'rejected') {
                // Delete the old rejected request and create a new one
                await FriendRequest.findByIdAndDelete(existingRequest._id);
            } else {
                return res.status(400).json({ 
                    message: 'Friend request already exists',
                    code: 'REQUEST_EXISTS',
                    userId: recipientId,
                    requestId: existingRequest._id,
                    status: existingRequest.status
                });
            }
        }

        // Create new friend request
        const newRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
            status: 'pending'
        });

        console.log("Friend request created successfully:", newRequest._id);

        return res.status(201).json({ 
            message: 'Friend request sent', 
            success: true,
            request: {
                _id: newRequest._id,
                sender: myId,
                recipient: recipientId,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            success: false,
            error: error.message 
        });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        const currentUserId = req.user._id;

        console.log("Accepting friend request:", { requestId, currentUserId });

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ 
                message: 'Friend request not found',
                success: false 
            });
        }

        if (friendRequest.recipient.toString() !== currentUserId.toString()) {
            return res.status(403).json({ 
                message: 'You can only accept requests sent to you',
                success: false 
            });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ 
                message: `Friend request already ${friendRequest.status}`,
                success: false 
            });
        }

        // Use a transaction to ensure atomicity
        const session = await User.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Accept the friend request
                await FriendRequest.findByIdAndUpdate(
                    requestId,
                    { status: 'accepted' },
                    { session }
                );

                // Add users to each other's friends list using $addToSet to prevent duplicates
                await User.findByIdAndUpdate(
                    friendRequest.sender,
                    { $addToSet: { friends: friendRequest.recipient } },
                    { session }
                );
                
                await User.findByIdAndUpdate(
                    friendRequest.recipient,
                    { $addToSet: { friends: friendRequest.sender } },
                    { session }
                );
            });

            console.log("Friend request accepted successfully:", requestId);

            // Fetch the updated friend request with populated user data
            const updatedRequest = await FriendRequest.findById(requestId)
                .populate('sender recipient', 'fullName profilePic nativeLanguage learningLanguage');

            return res.status(200).json({ 
                message: 'Friend request accepted',
                success: true,
                updatedRequest: updatedRequest
            });

        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            success: false,
            error: error.message 
        });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user._id,
            status: 'pending'
        })
        .populate('sender', 'fullName profilePic nativeLanguage learningLanguage')
        .select('-__v')
        .sort({ createdAt: -1 }); // Sort by newest first

        const acceptedRequests = await FriendRequest.find({
            $or: [
                { sender: req.user._id, status: 'accepted' },
                { recipient: req.user._id, status: 'accepted' }
            ]
        })
        .populate('sender recipient', 'fullName profilePic')
        .select('-__v')
        .sort({ updatedAt: -1 }); // Sort by most recently updated

        // Filter out requests with null senders/recipients
        const filteredIncoming = incomingRequests.filter(req => req.sender != null);
        const filteredAccepted = acceptedRequests.filter(req => 
            req.sender != null && req.recipient != null
        );

        return res.status(200).json({ 
            incomingReqs: filteredIncoming,
            acceptedReqs: filteredAccepted
        });
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user._id,
            status: 'pending'
        })
        .populate('recipient', 'fullName profilePic nativeLanguage learningLanguage')
        .select('-__v')
        .sort({ createdAt: -1 }); // Sort by newest first

        // Filter out requests with null recipients
        const filteredOutgoing = outgoingRequests.filter(req => req.recipient != null);

        return res.status(200).json({ 
            outgoingRequests: filteredOutgoing
        });
    } catch (error) {
        console.error('Error fetching outgoing friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Additional helper function to reject friend requests
export async function rejectFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        const currentUserId = req.user._id;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ 
                message: 'Friend request not found',
                success: false 
            });
        }

        if (friendRequest.recipient.toString() !== currentUserId.toString()) {
            return res.status(403).json({ 
                message: 'You can only reject requests sent to you',
                success: false 
            });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ 
                message: `Friend request already ${friendRequest.status}`,
                success: false 
            });
        }

        // Mark as rejected
        friendRequest.status = 'rejected';
        await friendRequest.save();

        return res.status(200).json({ 
            message: 'Friend request rejected',
            success: true,
            updatedRequest: friendRequest
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            success: false,
            error: error.message 
        });
    }
}

// Helper function to cancel sent friend request
export async function cancelFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;
        const currentUserId = req.user._id;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ 
                message: 'Friend request not found',
                success: false 
            });
        }

        if (friendRequest.sender.toString() !== currentUserId.toString()) {
            return res.status(403).json({ 
                message: 'You can only cancel requests you sent',
                success: false 
            });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ 
                message: `Cannot cancel ${friendRequest.status} request`,
                success: false 
            });
        }

        // Delete the request
        await FriendRequest.findByIdAndDelete(requestId);

        return res.status(200).json({ 
            message: 'Friend request cancelled',
            success: true
        });
    } catch (error) {
        console.error('Error cancelling friend request:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            success: false,
            error: error.message 
        });
    }
}