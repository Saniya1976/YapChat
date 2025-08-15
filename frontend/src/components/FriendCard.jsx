import React from 'react'
import { LANGUAGE_TO_FLAG } from "../constants";
import { Link } from "react-router-dom";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12 bg-gray-200 rounded-full flex items-center justify-center">
            <img 
              src={friend.profilePic || 'https://yourcdn.com/default-avatar.png'} 
              alt={friend.fullName}
              className="rounded-full w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                e.target.parentElement.innerHTML = `
                  <span class="text-lg font-semibold text-gray-600">
                    ${friend.fullName?.charAt(0) || 'U'}
                  </span>
                `;
              }}
            />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>


        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>
        
        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
        loading="lazy" // Add lazy loading
      />
    );
  }
  return null;
}