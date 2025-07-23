import { useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Home from './pages/dashboard/Home.jsx';
import Income from './pages/dashboard/income.jsx';
import Expense from './pages/dashboard/expense.jsx';
import Login from './pages/auth/Login_temp.jsx';
import SignUp from './pages/auth/SignUp.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
      </Routes>
    </Router>
  )
}

export default App

const Root = () => {
  const isAuthenticated = localStorage.getItem('token')
  return (
    isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
  )
}
