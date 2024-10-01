// src/components/Dashboard/CarbonCredits.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CarbonCredits() {
  const [credits, setCredits] = useState([]);
  const [newCredit, setNewCredit] = useState({ credit_id: '', quantity: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await api.get('/carbon/');
      setCredits(response.data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const handleCreateCredit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/carbon/', newCredit);
      fetchCredits();
      setNewCredit({ credit_id: '', quantity: '' });
    } catch (error) {
      console.error('Failed to create credit:', error);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Carbon Credits</h2>
      
      {user?.role === 'admin' && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Create New Carbon Credit</h3>
          <form onSubmit={handleCreateCredit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="credit_id" className="block text-sm font-medium text-gray-700">
                  Credit ID
                </label>
                <input
                  type="text"
                  id="credit_id"
                  placeholder="Enter Credit ID"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newCredit.credit_id}
                  onChange={(e) => setNewCredit({...newCredit, credit_id: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  placeholder="Enter Quantity"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newCredit.quantity}
                  onChange={(e) => setNewCredit({...newCredit, quantity: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Credit
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-lg font-medium mb-4">Available Credits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credits.length > 0 ? (
          credits.map((credit) => (
            <div key={credit.credit_id} className="border p-4 rounded shadow">
              <h4 className="font-bold">Credit ID: {credit.credit_id}</h4>
              <p>Quantity: {credit.quantity}</p>
              <p>Owner ID: {credit.owner_id}</p>
              <p>Created: {new Date(credit.created_at).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No carbon credits available.</p>
        )}
      </div>
    </div>
  );
}