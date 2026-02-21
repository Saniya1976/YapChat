import React from 'react';
import { Link } from "react-router-dom";
import { getLanguageFlag } from "../lib/utils.jsx";
import Avatar from './Avatar.jsx';

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-base-300">
      <div className="card-body p-4 flex flex-col h-full">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3 shrink-0">
          <Avatar
            src={friend.profilePic}
            alt={friend.fullName}
            size="size-12"
          />
          <h3 className="font-semibold truncate text-lg">{friend.fullName}</h3>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-col gap-2 mb-4 flex-grow">
          <div className="flex items-center gap-2">
            <span className="badge badge-secondary badge-sm py-3 px-3">
              {getLanguageFlag(friend.nativeLanguage)}
              <span className="ml-1">Native: {friend.nativeLanguage}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-outline badge-sm py-3 px-3">
              {getLanguageFlag(friend.learningLanguage)}
              <span className="ml-1">Learning: {friend.learningLanguage}</span>
            </span>
          </div>
        </div>

        {/* ACTION */}
        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-primary btn-outline w-full mt-auto group hover:scale-[1.02] transition-transform"
        >
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;