import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-bg flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-gov-border border-t-gov-blue rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gov-muted font-medium">Verifying citizen demo session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    const isOfficer = user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in'));
    return <Navigate to={isOfficer ? '/officer' : '/dashboard'} replace />;
  }

  return children;
};
