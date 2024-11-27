import React, { useState, useEffect, useContext } from 'react';
import { getBuyerCredits, purchaseCredit, getPurchasedCredits, generateCertificate } from '../api/api';
import { CC_Context } from "../context/SmartContractConnector.js";
import { ethers } from "ethers";

const BuyerDashboard = ({ onLogout }) => {
  const [availableCredits, setAvailableCredits] = useState([]);
  const [purchasedCredits, setPurchasedCredits] = useState([]);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  const { 
    connectWallet, 
    generateCredit, 
    getCreditDetails,
    getNextCreditId,
    getPrice,
    sellCredit,
    buyCredit,
    currentAccount
    // error 
  } = useContext(CC_Context);

  const fetchAllCredits = async () => {
    try {
      const [availableResponse, purchasedResponse] = await Promise.all([
        getBuyerCredits(),
        getPurchasedCredits()
      ]);
      setAvailableCredits(availableResponse.data);
      setPurchasedCredits(purchasedResponse.data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setError('Failed to fetch credits. Please try again.');
    }
  };

  useEffect(() => {
    fetchAllCredits();
  }, []);

  const handleBuyCredit = async (creditId) => {
    try {
      setError(null);
      //NOTE: the -1 is temporary
      // const price = await getPrice();
      const credit = await getCreditDetails(creditId-1);
      // Convert the price from wei to ether for the transaction
      const priceInEther = ethers.formatEther(credit.price);
      console.log("id, price: ", creditId-1, priceInEther);
      await buyCredit(creditId-1, priceInEther);
      await purchaseCredit({ credit_id: creditId, amount: 1 });
      await fetchAllCredits(); // Refresh both available and purchased credits
    } catch (error) {
      console.error('Failed to purchase credit:', error);
      setError('Failed to purchase credit. Please try again.');
    }
  };

  const handleGenerateCertificate = async (purchaseId) => {
    try {
      setError(null);
      const response = await generateCertificate(purchaseId);
      setCertificateData(response.data);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      setError('Failed to generate certificate. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Buyer Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">View and purchase carbon credits</p>
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

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
                      <button 
                        onClick={() => handleBuyCredit(credit.id)} 
                        className="btn btn-secondary"
                        disabled={credit.amount <= 0}
                      >
                        {credit.amount > 0 ? 'Buy' : 'Out of Stock'}
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
            {purchasedCredits.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {purchasedCredits.map((credit, index) => (
                  <li 
                    key={index} 
                    className={`pl-3 pr-4 py-3 flex items-center justify-between text-sm ${
                      credit.is_expired ? 'bg-[#D4EDDA]' : ''
                    }`}
                  >
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {credit.name} - Amount: {credit.amount}, Price: ${credit.price}
                      </span>
                    </div>
                    {credit.is_expired && (
                      <div className="ml-4 flex-shrink-0">
                        <button 
                          onClick={() => handleGenerateCertificate(credit.id)} 
                          className="btn btn-secondary"
                        >
                          Generate Certificate
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No credits purchased yet.</p>
            )}

            </dd>
          </div>
          
          {certificateData && (
            <div className="mt-6 bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Certificate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div 
                  className="border rounded-md p-4"
                  dangerouslySetInnerHTML={{ __html: certificateData.certificate_html }}
                />
              </dd>
            </div>
          )}
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