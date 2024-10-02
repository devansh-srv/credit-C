import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import AdminSignup from './components/AdminSignup';
import BuyerSignup from './components/BuyerSignup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BuyerDashboard from './components/BuyerDashboard';

const Navigation = ({ user, onLogout }) => (
  <nav className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-primary">CarbonCredit</span>
          </div>
          <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
            <Link to="/login" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Login</Link>
            <Link to="/admin-signup" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Admin Signup</Link>
            <Link to="/buyer-signup" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Buyer Signup</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin-dashboard" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Admin Dashboard</Link>
            )}
            {user && user.role === 'buyer' && (
              <Link to="/buyer-dashboard" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Buyer Dashboard</Link>
            )}
          </div>
        </div>
        <div className="hidden sm:ml-6 sm:flex sm:items-center">
          {user && (
            <button onClick={onLogout} className="btn btn-secondary">Logout</button>
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
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation user={user} onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/buyer-signup" element={<BuyerSignup />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
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
  );
};

export default App;