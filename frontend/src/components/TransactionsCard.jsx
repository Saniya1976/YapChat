import React from "react";
import transactionIcon from "../../../assets/icons/transactions.png"; // correct path

const TransactionsCard = () => {
  const transactions = [
    { id: 1, title: "Groceries", date: "2 Jan", icon: transactionIcon },
    { id: 2, title: "Electricity Bill", date: "5 Jan", icon: transactionIcon },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">All Transactions</h2>
          <p className="text-sm text-gray-500">2nd Jan to 21th Dec</p>
        </div>
        <button className="bg-purple-200 text-purple-800 px-4 py-1 rounded-lg text-sm font-semibold">
          View More
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center space-x-2">
            <img src={transaction.icon} alt="icon" className="w-6 h-6" />
            <p className="text-sm">{transaction.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsCard;
