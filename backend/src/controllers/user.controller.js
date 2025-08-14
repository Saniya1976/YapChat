import { Router } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../lib/stream.js';
import FriendRequest from '../models/FriendRequest.js';

export async function getRecommendedUsers(req,res){
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


export async function getMyFriends(req,res){
try {
   const user=await User.findById(req.user._id)
   .select('friends')
   .populate("friends","fullName profilePicture nativeLanguage learningLanguage");
   return res.status(200).json({ friends: user.friends });
} catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({message: 'Internal server error'});
    
}
}
export async function sendFriendRequest(req, res) {
    try {
       const myId= req.user._id;
       const {id:recipientId}=req.params; 
       //prevent sending friend request to self
       if(myId.toString() === recipientId){
           return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
       }
       const recipient=await User.findById(recipientId);
       if(!recipient){
           return res.status(404).json({ message: 'Recipient not found' });
         }
         //check if friend request already exists
         if(recipient.friends.includes(myId)){
            return res.status(400).json({ message: 'You are already friends with this user' });
         }
         //check if friend request already sent
         const existingRequest = await FriendRequest.findOne({
            $or:[
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
         });
         if(existingRequest){
            return res.status(400).json({ message: 'Friend request already sent' });
         }
            //create new friend request
            const newRequest = await FriendRequest.create({
                sender: myId,
                recipient: recipientId
            });
            return res.status(201).json({ message: 'Friend request sent', request: newRequest });
    } catch (error) {
        console.error('Error sending friend request:', error);
        return res.status(500).json({ message: 'Internal server error' });
        
    }
}
export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }
        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only accept requests sent to you' });
        }
       // Accept the friend request
       friendRequest.status = 'accepted';
       await friendRequest.save();

       // Add the users to each other's friends list
       await User.findByIdAndUpdate(friendRequest.sender,
         { $addToSet: { friends: friendRequest.recipient } 
        });
       await User.findByIdAndUpdate(friendRequest.recipient,
         { $addToSet: { friends: friendRequest.sender } 
        });

       return res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingRequests = await FriendRequest.find(
            { recipient: req.user._id ,
                 status: 'pending' }
        )
            .populate('sender', 'fullName profilePicture nativeLanguage learningLanguage')
            .select('-__v');
         const acceptedRequests = await FriendRequest.find(
            { recipient: req.user._id,
                status: 'accepted' }
        )
            .populate('sender', 'fullName profilePicture')
            .select('-__v');

        return res.status(200).json({  incomingRequests, acceptedRequests });
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find(
            { sender: req.user._id, status: 'pending' }
        )
           .populate('recipient', 'fullName profilePicture nativeLanguage learningLanguage')
            .select('-__v');

        return res.status(200).json({ outgoingRequests });
    } catch (error) {
        console.error('Error fetching outgoing friend requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}