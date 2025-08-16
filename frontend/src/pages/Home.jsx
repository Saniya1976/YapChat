import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { 
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest 
} from '../lib/api.js';
import { getLanguageFlag } from '../components/FriendCard.jsx';
import FriendCard from '../components/FriendCard.jsx';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import NoFriendsFound from '../components/NoFriendsFound .jsx';

const Home = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Set()); // Track individual button loading

  // Clear any cached data on mount to prevent stale data issues
  useEffect(() => {
    setOutgoingRequestsIds(new Set());
    setPendingRequests(new Set());
  }, []);

  // Friends Query
  const { data: friendsData = {}, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends
  });
  const friends = friendsData.friends || [];

  // Recommended Users Query
  const { data: recommendedUsersData = {}, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers
  });
  const recommendedUsers = recommendedUsersData.recommendedUsers || [];

  // Outgoing Friend Requests Query
  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ['outgoingFriendReqs'],
    queryFn: getOutgoingFriendReqs,
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });

  // Send Friend Request Mutation
  const { mutate: sendRequestMutation, isPending, error } = useMutation({
    mutationFn: (userId) => sendFriendRequest(userId),
    onMutate: async (userId) => {
      // Add to pending requests for this specific button
      setPendingRequests((prev) => new Set(prev).add(userId));
      
      // Optimistically add the user ID to pending requests
      setOutgoingRequestsIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    },
    onSuccess: (data, userId) => {
      // Remove from pending requests
      setPendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      
      // Refetch to sync with backend
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error, userId) => {
      console.error('Friend request failed:', {
        userId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        fullError: error.response?.data
      });
      
      // Check for specific error types
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      const isAlreadyExists = errorMessage.includes('already exists') || 
                            errorMessage.includes('already sent') ||
                            errorMessage.includes('duplicate');
      
      const isSelfRequest = errorMessage.includes('cannot send friend request to yourself') ||
                           errorMessage.includes('self');
      
      // Always remove from pending requests
      setPendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      
      // If it's already exists error, keep it in the outgoing requests
      // If it's any other error (like self-request, validation error, etc.), remove it
      if (!isAlreadyExists) {
        setOutgoingRequestsIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
      
      // You could also show a toast notification here
      // For example: toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  });

  // Populate outgoingRequestsIds from server
  useEffect(() => {
    console.log('🔍 Raw outgoingFriendReqs data:', outgoingFriendReqs);
    
    const outgoingIds = new Set();
    
    // Handle both possible data structures
    let requestsArray = [];
    if (Array.isArray(outgoingFriendReqs)) {
      requestsArray = outgoingFriendReqs;
      console.log('📋 Using direct array structure');
    } else if (outgoingFriendReqs?.outgoingRequests && Array.isArray(outgoingFriendReqs.outgoingRequests)) {
      requestsArray = outgoingFriendReqs.outgoingRequests;
      console.log('📋 Using outgoingRequests property');
    } else if (outgoingFriendReqs?.outgoingReqs && Array.isArray(outgoingFriendReqs.outgoingReqs)) {
      requestsArray = outgoingFriendReqs.outgoingReqs;
      console.log('📋 Using outgoingReqs property');
    }
    
    console.log('📋 Requests array to process:', requestsArray);
    
    if (requestsArray.length > 0) {
      requestsArray.forEach((req, index) => {
        console.log(`📋 Processing request ${index}:`, req);
        
        // Handle different possible structures
        const recipientId = req.recipient?._id || 
                           req.recipient || 
                           req.to?._id || 
                           req.to ||
                           req.recipientId ||
                           req.userId;
        
        console.log(`📋 Extracted recipient ID: ${recipientId}`);
        
        if (recipientId) {
          outgoingIds.add(recipientId);
        }
      });
    }
    
    console.log('📋 Final outgoing IDs set:', Array.from(outgoingIds));
    
    // Only update if the Set contents have actually changed
    setOutgoingRequestsIds(prevIds => {
      // Convert both sets to arrays and compare
      const prevArray = Array.from(prevIds).sort();
      const newArray = Array.from(outgoingIds).sort();
      
      console.log('📋 Previous IDs:', prevArray);
      console.log('📋 New IDs:', newArray);
      
      // Check if they're different
      if (prevArray.length !== newArray.length || 
          !prevArray.every((id, index) => id === newArray[index])) {
        console.log('📋 Updating outgoingRequestsIds state');
        return outgoingIds;
      }
      
      console.log('📋 No change needed, keeping previous state');
      // Return previous state if no change
      return prevIds;
    });
  }, [outgoingFriendReqs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="container mx-auto space-y-12 px-4 sm:px-6 py-8">

        {/* Friends Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm bg-base-100/70 rounded-xl p-4 border border-base-300 shadow-md">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Friends
            </h2>
            <p className="text-base-content/60 text-sm">
              Connect and practice with your language partners
            </p>
          </div>
          <Link 
            to="/notifications" 
            className="btn btn-outline btn-sm btn-primary hover:btn-primary hover:scale-105 transition-all duration-300 shadow-md"
          >
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Grid */}
        {loadingFriends ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-base-content/60">Loading your friends...</p>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="transform hover:scale-105 transition-transform duration-300">
            <NoFriendsFound />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {friends.map((friend) => (
              <div key={friend._id} className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <FriendCard 
                  friend={{
                    ...friend,
                    profilePic: friend.profilePic || '/default-avatar.png'
                  }} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Recommended Users Section */}
        <section className="space-y-8">
          <div className="backdrop-blur-sm bg-base-100/70 rounded-xl p-4 border border-base-300 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Meet New Learners
                </h2>
                <p className="text-base-content/70 text-sm">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg text-secondary" />
                <p className="text-base-content/60">Finding new language partners...</p>
              </div>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-gradient-to-r from-base-200 to-base-300 border border-base-300 shadow-xl p-8 text-center transform hover:scale-105 transition-all duration-300">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <UsersIcon className="size-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">No recommendations available</h3>
                <p className="text-base-content/70">
                  Check back later for new language partners!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                const isThisButtonPending = pendingRequests.has(user._id);
                const hasError = error?.response?.data?.userId === user._id;

                // Debug logging for each user
                console.log(`👤 User ${user.fullName} (${user._id}):`);
                console.log(`  - Has request been sent: ${hasRequestBeenSent}`);
                console.log(`  - Is pending: ${isThisButtonPending}`);
                console.log(`  - Has error: ${hasError}`);
                console.log(`  - Current outgoing IDs:`, Array.from(outgoingRequestsIds));

                return (
                  <div 
                    key={user._id}
                    className="card bg-gradient-to-br from-base-100 to-base-200 hover:from-base-50 hover:to-base-100 border border-base-300 hover:border-primary/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                          <div className="rounded-full overflow-hidden">
                            <img 
                              src={user.profilePic} 
                              alt={user.fullName}
                              className="hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs text-base-content/70 mt-1">
                              <MapPinIcon className="size-3 mr-1 text-primary/60" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary hover:badge-primary transition-colors duration-300">
                          <span className="mr-1">{getLanguageFlag(user.nativeLanguage)}</span>
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline hover:badge-outline-primary transition-colors duration-300">
                          <span className="mr-1">{getLanguageFlag(user.learningLanguage)}</span>
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {/* Bio */}
                      {user.bio && <p className="text-sm text-base-content/70 leading-relaxed">{user.bio}</p>}
                   
                      {/* Action Button */}
                      <button
                        className={`btn w-full mt-2 transition-all duration-300 ${
                          hasRequestBeenSent 
                            ? "btn-success btn-disabled shadow-md" 
                            : hasError
                            ? "btn-error hover:btn-error-focus hover:scale-105 shadow-lg hover:shadow-xl"
                            : "btn-primary hover:btn-primary-focus hover:scale-105 shadow-lg hover:shadow-xl"
                        }`}
                        onClick={() => {
                          if (!hasRequestBeenSent) {
                            sendRequestMutation(user._id);
                          }
                        }}
                        disabled={hasRequestBeenSent || isThisButtonPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : hasError ? (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Try Again
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            {isThisButtonPending ? "Sending..." : "Send Friend Request"}
                          </>
                        )}
                      </button>

                      {/* Debug Info - Remove this in production
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs bg-base-300 p-2 rounded mt-2">
                          <div>User ID: {user._id}</div>
                          <div>Has Request: {hasRequestBeenSent ? 'Yes' : 'No'}</div>
                          <div>Is Pending: {isThisButtonPending ? 'Yes' : 'No'}</div>
                          <div>In Outgoing Set: {outgoingRequestsIds.has(user._id) ? 'Yes' : 'No'}</div>
                        </div> */}
                      {/* )} */}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home

const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);