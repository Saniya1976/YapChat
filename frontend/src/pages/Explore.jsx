import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getRecommendedUsers, sendFriendRequest, getOutgoingFriendReqs } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';
import { getLanguageFlag, capitalize } from '../lib/utils.jsx';
import { CompassIcon, MapPinIcon, UserPlusIcon, CheckCircleIcon, SearchIcon, XIcon } from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser.js';

const Explore = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    const [searchTerm, setSearchTerm] = useState("");

    // Recommended Users
    const { data: recommendedData = {}, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getRecommendedUsers
    });
    const users = recommendedData.recommendedUsers || [];

    // Outgoing Requests for status checking
    const { data: outgoingReqsRaw = [] } = useQuery({
        queryKey: ['outgoingFriendReqs'],
        queryFn: getOutgoingFriendReqs
    });

    const outgoingRequests = Array.isArray(outgoingReqsRaw)
        ? outgoingReqsRaw
        : (outgoingReqsRaw?.outgoingRequests || outgoingReqsRaw?.outgoingReqs || []);

    const { mutate: sendRequest, isPending } = useMutation({
        mutationFn: sendFriendRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
        }
    });

    const isRequestSent = (userId) => {
        return outgoingRequests.some(req =>
            (req.recipient?._id === userId) || (req.recipient === userId)
        );
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nativeLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.learningLanguage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-3xl border border-base-300 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg">
                            <CompassIcon className="size-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Explore Community</h1>
                            <p className="text-base-content/60">Find your perfect language exchange partner</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search by name or language (e.g. 'Spanish')..."
                            className="input input-lg input-bordered w-full pl-12 bg-base-100 transition-all focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-base-200 rounded-full"
                            >
                                <XIcon className="size-4" />
                            </button>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 bg-base-200/30 rounded-3xl border-2 border-dashed border-base-300">
                        <div className="bg-base-300/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="size-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold">No learners found</h3>
                        <p className="text-base-content/50">Try searching for a different name or language</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map((user) => {
                            const sent = isRequestSent(user._id);
                            return (
                                <div key={user._id} className="card bg-base-200 border border-base-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full transform hover:scale-[1.03]">
                                    <div className="card-body p-4 flex flex-col h-full">
                                        {/* User Header */}
                                        <div className="flex items-center gap-3 mb-4 shrink-0">
                                            <Avatar
                                                src={user.profilePic}
                                                alt={user.fullName}
                                                size="size-12"
                                                className="shadow-sm"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-bold truncate text-base-content">{user.fullName}</h3>
                                                {user.location && (
                                                    <p className="text-[10px] text-base-content/50 truncate flex items-center">
                                                        <MapPinIcon className="size-2 mr-0.5" />
                                                        {user.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Languages - Vertical Stacked for compactness */}
                                        <div className="flex flex-col gap-1.5 flex-grow mb-4">
                                            <div className="badge badge-secondary badge-xs py-2 px-2 gap-1 w-fit">
                                                {getLanguageFlag(user.nativeLanguage)}
                                                <span>Native: {capitalize(user.nativeLanguage)}</span>
                                            </div>
                                            <div className="badge badge-outline badge-xs py-2 px-2 gap-1 w-fit">
                                                {getLanguageFlag(user.learningLanguage)}
                                                <span>Learning: {capitalize(user.learningLanguage)}</span>
                                            </div>

                                            {/* Micro Bio */}
                                            {user.bio && (
                                                <p className="text-[11px] text-base-content/60 italic line-clamp-2 mt-2 leading-tight">
                                                    "{user.bio}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            <button
                                                className={`btn btn-sm w-full gap-2 transition-all ${sent ? 'btn-success btn-disabled' : 'btn-primary shadow-sm hover:scale-[1.02]'}`}
                                                onClick={() => !sent && sendRequest(user._id)}
                                                disabled={sent || isPending}
                                            >
                                                {sent ? (
                                                    <><CheckCircleIcon className="size-3" /> Sent</>
                                                ) : (
                                                    <><UserPlusIcon className="size-3" /> Add Friend</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
