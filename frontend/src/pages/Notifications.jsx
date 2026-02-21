import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { acceptFriendRequest, getFriendRequests } from "../lib/api.js";
import NoNotificationsFound from "../components/NoNotificationsFound.jsx";
import Avatar from "../components/Avatar.jsx";
import useAuthUser from "../hooks/useAuthUser.js";

const Notifications = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const { data: friendRequests, isLoading, error } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    }
  });

  // Safely extract requests with fallbacks
  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="alert alert-error">
            Error loading notifications: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request?._id || Math.random()}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={request?.sender?.profilePic}
                              alt={request?.sender?.fullName}
                              size="size-14"
                            />
                            <div>
                              <h3 className="font-semibold">
                                {request?.sender?.fullName || 'Unknown User'}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {request?.sender?.nativeLanguage && (
                                  <span className="badge badge-secondary badge-sm">
                                    Native: {request.sender.nativeLanguage}
                                  </span>
                                )}
                                {request?.sender?.learningLanguage && (
                                  <span className="badge badge-outline badge-sm">
                                    Learning: {request.sender.learningLanguage}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => request?._id && acceptRequestMutation(request._id)}
                            disabled={isPending || !request?._id}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATIONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => {
                    // Determine which user is the 'other' person
                    const isCurrentUserRecipient = notification?.recipient?._id === authUser?._id;
                    const otherPerson = isCurrentUserRecipient ? notification?.sender : notification?.recipient;
                    const actionText = isCurrentUserRecipient
                      ? "You accepted a friend request from"
                      : "accepted your friend request";

                    return (
                      <div
                        key={notification?._id || Math.random()}
                        className="card bg-base-200 shadow-sm border border-base-300/30 overflow-hidden"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={otherPerson?.profilePic}
                              alt={otherPerson?.fullName}
                              size="size-12"
                            />
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-bold text-base-content">{otherPerson?.fullName || 'Someone'}</span>
                                {" "}
                                {isCurrentUserRecipient
                                  ? `is now your friend!`
                                  : `accepted your friend request!`}
                              </p>
                              <p className="text-xs flex items-center opacity-50 mt-1">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Recently
                              </p>
                            </div>
                            <div className="badge badge-success badge-sm py-3 px-3 gap-1.5 font-medium">
                              <UserCheckIcon className="h-3.5 w-3.5" />
                              Connected
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;