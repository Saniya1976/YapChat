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
    queryFn: getOutgoingFriendReqs
  });

  // Send Friend Request Mutation
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_, userId) => {
      // Update local state instantly
      setOutgoingRequestsIds((prev) => new Set(prev).add(userId));

      // Refetch updated data from backend
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Failed to send friend request:", error);
      // Optional: show a toast here
    }
  });

  // Populate outgoingRequestsIds from server
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
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
          <div className="backdrop-blur-sm bg-base-100/70 rounded-2xl p-6 border border-base-300 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Meet New Learners
                </h2>
                <p className="text-base-content/70 mt-2 text-lg">
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
                            : "btn-primary hover:btn-primary-focus hover:scale-105 shadow-lg hover:shadow-xl"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            {isPending ? "Sending..." : "Send Friend Request"}
                          </>
                        )}
                      </button>
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
