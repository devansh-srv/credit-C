import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import AdminSignup from './components/AdminSignup';
import BuyerSignup from './components/BuyerSignup';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import TestPage from './components/testPage';

import {CCProvider} from './context/SimpleSmartContract'
import api from './api/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const verifyToken = async (token) => {
    try {
      const response = await api.get('/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      
      if (error.response && error.response.status === 401) {
        throw error;
      }
     
      return {
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role')
      };
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
  
        if (token && storedUsername && storedRole) {
          try {
            const userData = await verifyToken(token);
            
            setUser({
              username: userData.username || storedUsername,
              role: userData.role || storedRole,
              token: token
            });
  
            if (userData.new_token) {
              localStorage.setItem('token', userData.new_token);
            }
          } catch (verifyError) {
           
            if (verifyError.response && verifyError.response.status === 401) {
              localStorage.clear();
              setUser(null);
            } else {
              
              setUser({
                username: storedUsername,
                role: storedRole,
                token: token
              });
            }
          }
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
      } finally {
        setLoading(false);
      }
    };
  
    initializeUser();
  }, []);

  const handleLogin = async (userData) => {
    try {
      
      localStorage.setItem('token', userData.token);
      localStorage.setItem('username', userData.username);
      localStorage.setItem('role', userData.role);
      
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <CCProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation user={user} onLogout={handleLogout} />
          {error && (
            <div className="max-w-7xl mx-auto px-4 py-2 mt-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/buyer-signup" element={<BuyerSignup />} />
              <Route path="/login" element={
                user ? (
                  <Navigate to={`/${user.role}-dashboard`} replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } />
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
              <Route path="/" element={
                user ? (
                  <Navigate to={`/${user.role}-dashboard`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </CCProvider>
  );
};

export default App;