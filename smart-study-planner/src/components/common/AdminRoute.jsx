import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../ui/Spinner/Spinner';

function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner fullPage />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
}

export default AdminRoute;
