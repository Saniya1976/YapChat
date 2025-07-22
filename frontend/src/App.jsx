import { useState } from 'react'
 import './App.css'
import {
  browserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Home from './pages/Home'
import Income from './pages/Income'
import Expense from './pages/Expense'
import Login from './pages/auth/login'
import SignUp from './pages/auth/signup'

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/Income" element={<Income />} />
          <Route path="/Expense" element={<Expense />} />
        </Routes>
      </Router>
      
    </>
  )
}

export default App
const Root=()=>{
  const isAuthenticated=localStorage.getItem('token');
  return(
    <>
    {isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
    </>
  )
}
