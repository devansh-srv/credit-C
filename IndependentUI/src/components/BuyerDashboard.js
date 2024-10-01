import React, { useState } from 'react';

const BuyerDashboard = ({ onLogout }) => {
  const [availableCredits, setAvailableCredits] = useState([
    { id: 1, name: 'Solar Credit', amount: 100, price: 50 },
    { id: 2, name: 'Wind Credit', amount: 150, price: 45 },
    { id: 3, name: 'Hydro Credit', amount: 80, price: 55 },
  ]);
  const [purchasedCredits, setPurchasedCredits] = useState([]);

  const handleBuyCredit = (creditId) => {
    const creditToBuy = availableCredits.find((credit) => credit.id === creditId);
    if (creditToBuy && creditToBuy.amount > 0) {
      setPurchasedCredits([...purchasedCredits, { ...creditToBuy, amount: 1 }]);
      setAvailableCredits(
        availableCredits.map((credit) =>
          credit.id === creditId ? { ...credit, amount: credit.amount - 1 } : credit
        )
      );
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Buyer Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">View and purchase carbon credits</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Available Credits</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {availableCredits.map((credit) => (
                  <li key={credit.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {credit.name} - Amount: {credit.amount}, Price: ${credit.price}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button onClick={() => handleBuyCredit(credit.id)} className="btn btn-secondary">
                        Buy
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Purchased Credits</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {purchasedCredits.map((credit, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {credit.name} - Amount: {credit.amount}, Price: ${credit.price}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <button onClick={onLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </div>
  );
};

export default BuyerDashboard;