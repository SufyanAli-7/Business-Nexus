import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute – wraps all routes that require authentication.
 * - If the app is still loading (checking session), shows a spinner.
 * - If the user is NOT logged in, redirects to /login.
 * - If the user IS logged in, renders the child routes via <Outlet />.
 */
const ProtectedRoute: React.FC = () => {
  const { isAuth, isAppLoading } = useAuth();

  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
