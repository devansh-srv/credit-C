import React, { useState, useEffect } from 'react';
import { getAdminCredits, createAdminCredit } from '../api/api';


const AdminDashboard = ({ onLogout }) => {
  const [availableCredits, setAvailableCredits] = useState([]);
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await getAdminCredits();
        setAvailableCredits(response.data);
      } catch (error) {
        console.error('Failed to fetch credits:', error);
      }
    };
    fetchCredits();
  }, []);
  const [newCredit, setNewCredit] = useState({ name: '', amount: 0, price: 0 });

  const handleCreateCredit = async (e) => {
    e.preventDefault();
    try {
      const response = await createAdminCredit(newCredit);
      setAvailableCredits([...availableCredits, response.data]);
      setNewCredit({ name: '', amount: 0, price: 0 });
    } catch (error) {
      console.error('Failed to create credit:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewCredit({ ...newCredit, [e.target.name]: e.target.value });
  };

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

export default AdminDashboard;