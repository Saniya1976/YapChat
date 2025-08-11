import React from 'react'
import useAuthUser from '../hooks/useAuthUser.js'
import { useLocation } from '../hooks/useLocation.js';
const Sidebar = () => {
   const{authUser}=useAuthUser();
   const{location}=useLocation
   return <div >Sidebar</div>
  
}

export default Sidebar