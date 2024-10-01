import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [credits, setCredits] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    carbon_credit_id: '',
    quantity: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
    fetchCredits();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transaction/');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await api.get('/carbon/');
      setCredits(response.data);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transaction/', newTransaction);
      fetchTransactions();
      fetchCredits();
      setNewTransaction({ carbon_credit_id: '', quantity: '' });
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      
      {user?.role === 'buyer' && (
        <form onSubmit={handleCreateTransaction} className="mb-8">
          <div className="flex gap-4">
            <select
              className="flex-1 p-2 border rounded"
              value={newTransaction.carbon_credit_id}
              onChange={(e) => setNewTransaction({...newTransaction, carbon_credit_id: e.target.value})}
            >
              <option value="">Select Credit</option>
              {credits.map((credit) => (
                <option key={credit.credit_id} value={credit.credit_id}>
                  {credit.credit_id} - Quantity: {credit.quantity}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              className="flex-1 p-2 border rounded"
              value={newTransaction.quantity}
              onChange={(e) => setNewTransaction({...newTransaction, quantity: e.target.value})}
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Create Transaction
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Transaction ID</th>
              <th className="px-4 py-2">Sender ID</th>
              <th className="px-4 py-2">Receiver ID</th>
              <th className="px-4 py-2">Credit ID</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.transaction_id} className="border-b">
                <td className="px-4 py-2">{transaction.transaction_id}</td>
                <td className="px-4 py-2">{transaction.sender_id}</td>
                <td className="px-4 py-2">{transaction.receiver_id}</td>
                <td className="px-4 py-2">{transaction.carbon_credit_id}</td>
                <td className="px-4 py-2">{transaction.quantity}</td>
                <td className="px-4 py-2">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
    </div>
  );
}