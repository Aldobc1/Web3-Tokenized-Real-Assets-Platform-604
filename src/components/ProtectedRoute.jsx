import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleCheck } from '../hooks/useRoleCheck';
import { useWeb3 } from '../contexts/Web3Context';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isConnected, isRegistered, sessionLoaded } = useWeb3();
  const { hasPermission } = useRoleCheck();
  const location = useLocation();

  // Show loading screen while session is being loaded
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // If user is not connected or registered, redirect to login
  if (!isConnected || !isRegistered) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If there's a required role and user doesn't have permission, redirect to home
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required permissions
  return children;
};

export default ProtectedRoute;