import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token by fetching user data
        const response = await axiosInstance.get('/auth/me');
        setUserData(response.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Auth token validation failed:", err);
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userData, 
      loading, 
      login, 
      logout, 
      setUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);