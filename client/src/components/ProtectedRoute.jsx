import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium text-sm">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={role === 'government' ? '/gov/login' : '/login'} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" />; // Or 404
  }

  return children;
};

export default ProtectedRoute;
