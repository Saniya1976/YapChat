import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser.js';
import useLogout from "../hooks/useLogout.js";
import { ShipWheelIcon, BellIcon, LogOutIcon, HomeIcon, UsersIcon, CompassIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector.jsx';
import Avatar from './Avatar.jsx';


const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith('/chat')
  const { logoutMutation } = useLogout();
  const currentPath = location.pathname;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center shadow-sm">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">

          {/* LOGO - Hidden on very small screens if we have nav icons */}
          <div className={`${isChatPage ? "flex" : "hidden sm:flex"} items-center gap-2.5 shrink-0`}>
            <Link to="/" className="flex items-center gap-2">
              <ShipWheelIcon className="size-7 sm:size-9 text-primary" />
              <span className="hidden xs:inline text-xl sm:text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                YapChat
              </span>
            </Link>
          </div>

          {/* MAIN NAVIGATION ICONS - Especially for mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className={`btn btn-ghost btn-sm sm:btn-md btn-circle ${currentPath === '/' ? 'text-primary' : 'opacity-70'}`}>
              <HomeIcon className="size-5 sm:size-6" />
            </Link>
            <Link to="/friends" className={`btn btn-ghost btn-sm sm:btn-md btn-circle ${currentPath === '/friends' ? 'text-primary' : 'opacity-70'}`}>
              <UsersIcon className="size-5 sm:size-6" />
            </Link>
            <Link to="/explore" className={`btn btn-ghost btn-sm sm:btn-md btn-circle ${currentPath === '/explore' ? 'text-primary' : 'opacity-70'}`}>
              <CompassIcon className="size-5 sm:size-6" />
            </Link>
            <Link to="/notifications" className={`btn btn-ghost btn-sm sm:btn-md btn-circle ${currentPath === '/notifications' ? 'text-primary' : 'opacity-70'}`}>
              <BellIcon className="size-5 sm:size-6" />
            </Link>
          </div>

          {/* ACTION SECTION */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <div className="hidden xs:block">
              <ThemeSelector />
            </div>

            <Avatar
              src={authUser?.profilePic}
              alt={authUser?.fullName}
              size="size-8 sm:size-9"
            />

            <button className="btn btn-ghost btn-sm sm:btn-md btn-circle text-error opacity-70 hover:opacity-100" onClick={logoutMutation}>
              <LogOutIcon className="size-5 sm:size-6" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar