import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken, getStoredUser } from '../utils/storage';

const ProtectedAdminRoute = ({ children }) => {
  const token = getAccessToken();
  const user  = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
