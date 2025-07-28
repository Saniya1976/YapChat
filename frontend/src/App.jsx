import React, {useState, useEffect } from 'react'
import './index.css' // ✅ Important for Tailwind
import { Route ,Routes} from 'react-router-dom'
import  Home  from './pages/Home.jsx'
import  Login  from './pages/Login.jsx'
import  SignUp  from './pages/SignUp.jsx'
import  Onboarding  from './pages/Onboarding.jsx'
import  Chat  from './pages/Chat.jsx'
import  Call  from './pages/Call.jsx'
import  Notifications  from './pages/Notifications.jsx'
import { Toaster, toast } from 'react-hot-toast'


export default function App() {
  const [data,setData] = useState([])
  const [loading, setLoading] = useState(true)
  return (
    <>
      <Toaster />
      <div className="min-h-screen " data-theme="coffee">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/call" element={<Call />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </>
  )
}
