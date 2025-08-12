import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import {useLocation} from 'react-router'


const Navbar = () => {
  const {authUser}=useAuthUser;
  const location=useLocation();
  const isChatPage=location.pathname?.startsWith('/chat')
  return (
    <div>Navbar</div>
  )
}

export default Navbar