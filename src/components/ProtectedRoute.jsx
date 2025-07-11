import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRoleCheck } from '../hooks/useRoleCheck';
import { useWeb3 } from '../contexts/Web3Context';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isConnected, isRegistered } = useWeb3();
  const { hasPermission } = useRoleCheck();

  if (!isConnected || !isRegistered) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;