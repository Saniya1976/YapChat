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
import PageLoader from './components/PageLoader.jsx';
import useAuthUser from './hooks/useAuthUser.js';

const App=()=> {
 
  const {isLoading,authUser}=useAuthUser;
  const isAuthenticated=Boolean(authUser)
  const isOnboarded=authUser?.isOnboarded

  if (isLoading) return <PageLoader/>;

  return (
    <>
      <Toaster />
      <div className="min-h-screen" data-theme="coffee">
        <Routes>
          {/* Protected Routes (need auth) */}
         <Route  path="/" element={isAuthenticated && isOnboarded ? (
         <HomePage />
          ) : (
         <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )}/>

          <Route path="/onboarding" element={isAuthenticated?<Onboarding /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isAuthenticated? <Chat />:<Navigate to="/login" />} />
          <Route path="/call" element={isAuthenticated? <Call />:<Navigate to="/login" />} />
          <Route path="/notifications" element={isAuthenticated? <Notifications />:<Navigate to="/login" />} />

          {/* Public Routes (if already logged in, redirect to home) */}
          <Route path="/login" element={!isAuthenticated?<Login />:<Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated?<SignUp />:<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
export default App;
