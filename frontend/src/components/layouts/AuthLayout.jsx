import React from 'react'
import transactioncard from '../../assets/images/transactions.png'
import { LuTrendingDown } from 'react-icons/lu'

// Local StatsInfoCard moved above
const StatsInfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-400/10 border border-gray-200/50 z-10">
      <div
        className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-xs text-gray-500 mb-1">{label}</h6>
        <span className="text-[20px]">{value}</span>
      </div>
    </div>
  )
}

const AuthLayout = ({ children }) => {
  return (
    <div className="flex w-screen h-screen ">
      <div className="w-screen h-screen md:w-[60vw] px-6  pb-10">
        <h2 className="text-lg font-medium text-black">Welcome to Expenzo</h2>
        {children}
      </div>

      <div className="hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover relative">
        {/* Purple shapes */}
        <div className="w-48 h-48 rounded-[40px] bg-purple-600 absolute top-2 left-2" />
        <div className="w-48 h-56 rounded-[40px] border-[20px] border-fuchsia-500 absolute top-1/2 left-[58%] -translate-y-1/2 -translate-x-1/2
" />
        <div className="w-48 h-48 rounded-[40px] bg-violet-500 absolute bottom-7 right-7" />

     {/* Stats Card */}
<div className="relative z-20 px-8 py-4">
  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 p-6 flex items-center gap-6 hover:shadow-2xl transition-all duration-300">
    <div className="w-12 h-12 flex items-center justify-center text-white text-2xl rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-md">
      <LuTrendingDown />
    </div>
    <div>
      <h6 className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        Track Your Income & Expenses
      </h6>
      <span className="text-xl font-semibold text-gray-800">
        ₹430,000
      </span>
    </div>
  </div>
</div>

        {/* Image */}
        <img
          src={transactioncard}
          alt="Transaction Card"
          className="absolute bottom-0 right-8 w-74 h-74 object-cover"
        />
      </div>
    </div>
  )
}

export default AuthLayout
