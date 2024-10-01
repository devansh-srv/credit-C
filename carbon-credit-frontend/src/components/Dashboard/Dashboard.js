// src/components/Dashboard/Dashboard.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CarbonCredits from './CarbonCredits';
import Transactions from './Transactions';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Carbon Credit Platform</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.email} ({user?.role})</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            {user?.role === 'admin' && (
              <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-green-700">
                  As an admin, you can create new carbon credits using the form below.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            <CarbonCredits />
            <Transactions />
          </div>
        </div>
      </main>
    </div>
  );
}