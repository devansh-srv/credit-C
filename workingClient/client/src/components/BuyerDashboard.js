import React, { useState, useEffect } from 'react';
import { getBuyerCredits, purchaseCredit, getPurchasedCredits } from '../api/api';


const BuyerDashboard = ({ onLogout }) => {
  const [availableCredits, setAvailableCredits] = useState([]);
  const [purchasedCredits, setPurchasedCredits] = useState([]);
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const [availableResponse, purchasedResponse] = await Promise.all([
          getBuyerCredits(),
          getPurchasedCredits()
        ]);
        setAvailableCredits(availableResponse.data);
        setPurchasedCredits(purchasedResponse.data);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    };
    fetchCredits();
  }, []);

  const handleBuyCredit = async (creditId) => {
    try {
      await purchaseCredit({ credit_id: creditId, amount: 1 });
      // Refresh credits after purchase
      const [availableResponse, purchasedResponse] = await Promise.all([
        getBuyerCredits(),
        getPurchasedCredits()
      ]);
      setAvailableCredits(availableResponse.data);
      setPurchasedCredits(purchasedResponse.data);
    } catch (error) {
      console.error('Failed to purchase credit:', error);
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