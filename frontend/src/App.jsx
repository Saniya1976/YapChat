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
import { useQuery } from '@tanstack/react-query'
import {axiosInstance} from './lib/axios.js'

export default function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todo'],
    queryFn: async () => {
      const res = await axiosInstance.get('/todos/');
      return res.data;
    }
  })
  console.log(data, isLoading, isError)

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
  );
}
