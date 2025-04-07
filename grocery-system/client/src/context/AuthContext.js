import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (token && userRole) {
        try {
          const response = await getCurrentUser(userRole);
          setCurrentUser(response.data.user);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.role);
    setCurrentUser(userData);
    setError(null);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
  };
  
  const isAuthenticated = () => {
    return !!currentUser;
  };
  
  const isSupplier = () => {
    return currentUser && currentUser.role === 'supplier';
  };
  
  const isStoreOwner = () => {
    return currentUser && currentUser.role === 'storeOwner';
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        error, 
        login, 
        logout,
        isAuthenticated,
        isSupplier,
        isStoreOwner,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 