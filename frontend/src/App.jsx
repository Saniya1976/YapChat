import React from 'react';
import './index.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Chat from './pages/Chat.jsx';
import Call from './pages/Call.jsx';
import Notifications from './pages/Notifications.jsx';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from './lib/axios.js';

export default function App() {
  const { data: authData, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data;
    },
  });

  const authUser = authData?.user;

  // if (isLoading) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <>
      <Toaster />
      <div className="min-h-screen" data-theme="coffee">
        <Routes>
          {/* Protected Routes (need auth) */}
          <Route path="/" element={authUser? <Home />:<Navigate to="/login" />} />
          <Route path="/onboarding" element={authUser?<Onboarding /> : <Navigate to="/login" />} />
          <Route path="/chat" element={authUser? <Chat />:<Navigate to="/login" />} />
          <Route path="/call" element={authUser? <Call />:<Navigate to="/login" />} />
          <Route path="/notifications" element={authUser? <Notifications />:<Navigate to="/login" />} />

          {/* Public Routes (if already logged in, redirect to home) */}
          <Route path="/login" element={!authUser?<Login />:<Navigate to="/" />} />
          <Route path="/signup" element={!authUser?<SignUp />:<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
