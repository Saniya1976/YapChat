import React from 'react'


function dashboard() {
  return (
    <div className="p-4">
      <TransactionsCard />
    </div>
  );
}

const Home = () => {
  return (
    <div>
      hello
      <h1 className="text-3xl font-bold text-center mb-4 text-purple-600 font-['winky-rough']">Welcome to the Dashboard!</h1>
      <p className="text-center text-gray-600 mb-6">Here you can manage your finances effectively.</p>
    </div>
  )
}

export default Home
