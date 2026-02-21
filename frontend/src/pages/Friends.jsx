import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { getUserFriends } from '../lib/api.js';
import FriendCard from '../components/FriendCard.jsx';
import NoFriendsFound from '../components/NoFriendsFound.jsx';
import { UsersIcon, SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Friends = () => {
    const { data: friendsData = {}, isLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends
    });
    const friends = friendsData.friends || [];

    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-200/50 p-6 rounded-2xl border border-base-300 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <UsersIcon className="size-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Your Friends</h1>
                            <p className="text-base-content/60">Manage your language learning connections</p>
                        </div>
                    </div>

                    <Link to="/explore" className="btn btn-primary gap-2 shadow-lg hover:scale-105 transition-all">
                        <SearchIcon className="size-4" />
                        Explore New Friends
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : friends.length === 0 ? (
                    <NoFriendsFound />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {friends.map((friend) => (
                            <div key={friend._id} className="h-full">
                                <FriendCard friend={friend} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
