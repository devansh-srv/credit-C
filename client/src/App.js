import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import AdminSignup from './components/AdminSignup';
import BuyerSignup from './components/BuyerSignup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import TestPage from './components/testPage';

import {CCProvider} from './context/SimpleSmartContract'


const Navigation = ({ user, onLogout }) => (
  <nav className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl font-bold text-primary">CarbonCredit</span>
        </div>
        <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
          {!user && (
            <>
              <Link to="/login" className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Login</Link>
              <Link to="/admin-signup" className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Admin Signup</Link>
              <Link to="/buyer-signup" className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Buyer Signup</Link>
            </>
          )}
          {user && user.role === 'admin' && (
            <Link to="/admin-dashboard" className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Admin Dashboard</Link>
          )}
          {user && user.role === 'buyer' && (
            <Link to="/buyer-dashboard" className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Buyer Dashboard</Link>
          )}
          {user && (
            <button onClick={onLogout} className="text-gray-700 hover:bg-gray-100 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">Logout</button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <CCProvider>
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/buyer-signup" element={<BuyerSignup />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/test" element={<TestPage/>}/>
            <Route 
              path="/admin-dashboard" 
              element={
                user && user.role === 'admin' ? 
                  <AdminDashboard onLogout={handleLogout} /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/buyer-dashboard" 
              element={
                user && user.role === 'buyer' ? 
                  <BuyerDashboard onLogout={handleLogout} /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
    </CCProvider>
  );
};

export default App;
