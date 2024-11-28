import React, { useContext, useState, useEffect } from 'react';
import { getAdminCredits, createAdminCredit, getTransactions, expireCreditApi } from '../api/api';
import { CC_Context } from "../context/SmartContractConnector.js";
import Swal from 'sweetalert2';
import { ethers } from "ethers";

const AdminDashboard = ({ onLogout }) => {

  const { 
    connectWallet, 
    generateCredit, 
    getCreditDetails,
    getNextCreditId,
    expireCredit,
    sellCredit,
    buyCredit,
    currentAccount, 
    error 
  } = useContext(CC_Context);

  const [myCredits, setMyCredits] = useState([]);
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await getAdminCredits();
        setMyCredits(response.data);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    };
    fetchCredits();
  }, []);

  const [newCredit, setNewCredit] = useState({creditId:0, name: '', amount: 0, price: 0 });

  const handleCreateCredit = async (e) => {
    e.preventDefault();

    if (!newCredit.name || !newCredit.amount || !newCredit.price) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      
      let newCreditId = getNextCreditId();
      setNewCredit((prevState) => ({ ...prevState, creditId: newCreditId }));

      await generateCredit(newCredit.amount, newCredit.price);
      const response = await createAdminCredit(newCredit);

      // Refetch the updated credit list after successful creation
      const updatedCredits = await getAdminCredits();
      setMyCredits(updatedCredits.data);

      setNewCredit({ name: '', amount: 0, price: 0 });
    } catch (error) {
      console.error('Failed to create credit:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewCredit({ ...newCredit, [e.target.name]: e.target.value });
  };

  
  const handleExpireCredit = async (creditId) => {
    console.log(`Expire credit called for credit ID: ${creditId}`);
    const SC_Credit_Id = creditId - 1;
  
    try {
      const response = await expireCreditApi(creditId);
      console.log(response.data);
  
      // Call the smart contract function
      await expireCredit(SC_Credit_Id);
  
      // SweetAlert for success
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Credit expired successfully!',
      });
  
      setMyCredits((prevCredits) =>
        prevCredits.map((credit) =>
          credit.id === creditId ? { ...credit, is_expired: true } : credit
        )
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Display a popup with the error message
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.response.data.message,
        });
      } else {
        console.error('Failed to expire credit:', error);
      }
    }
  };
  

  const [transactions, setTransactions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creditsResponse, transactionsResponse] = await Promise.all([
          getAdminCredits(),
          getTransactions()
        ]);
        setMyCredits(creditsResponse.data);
        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Dashboard</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage carbon credits</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Create New Credit</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <form onSubmit={handleCreateCredit} className="space-y-4">
                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Credit Name"
                  value={newCredit.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="input"
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={newCredit.amount}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="input"
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newCredit.price}
                  onChange={handleInputChange}
                  required
                />
                <button type="submit" className="btn btn-primary">Create Credit</button>
              </form>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">My Credits</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {myCredits.map((credit) => (
              <li 
                key={credit.id} 
                className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                  style={{ backgroundColor: credit.is_expired ? '#D4EDDA' : 'transparent' }} // Replace with your green hex
                >
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">
                      {credit.id - 1}: {credit.name} - Amount: {credit.amount}, Price: {credit.price} ETH
                    </span>
                  </div>
                {!credit.is_expired && (
                  <button
                    onClick={() => handleExpireCredit(credit.id)}
                    className="ml-4 px-3 py-1 text-white rounded hover:opacity-90"
                    style={{ backgroundColor: '#415e02' }} // Replace with your hex color
                  >
                    Expire Credit
                </button>
                )}
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
      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">Transactions</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <span className="ml-2 flex-1 w-0 truncate">
                    Buyer: {transaction.buyer}, Credit: {transaction.credit}, Amount: {transaction.amount}, Total Price: ${transaction.total_price}, Date: {new Date(transaction.timestamp).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </dd>
      </div>
    </div>
  );
};

export default AdminDashboard;
