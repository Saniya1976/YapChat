import React from 'react'
import TransactionsCard from "../TransactionsCard.jsx";

const AuthLayout = ({ children }) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex'>
      {/* Left side - Login */}
      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        {children}
      </div>
      
      {/* Right side - Transactions */}
      <div className='hidden md:block w-1/2 p-8'>
        <h2 className='text-lg font-medium text-white mb-8'>Expenzo</h2>
        <TransactionsCard />
      </div>
    </div>
  )
}

export default AuthLayout