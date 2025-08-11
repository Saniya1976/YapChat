import React from 'react'
import useAuthUser from '../hooks/useAuthUser.js'
import { Link,useLocation } from 'react-router'
import {ShipWheelIcon} from 'lucide-react'
const Sidebar = () => {
   const{authUser}=useAuthUser();
   const location=useLocation();
   const currentPath=location.Pathname
   return 
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            YapChat
          </span>
        </Link>
      </div>


   </aside>
  
}

export default Sidebar