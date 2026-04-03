import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/api/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isCitizen = user?.role === 'citizen';
  const isGovernment = user?.role === 'government';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isCitizen, isGovernment, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
