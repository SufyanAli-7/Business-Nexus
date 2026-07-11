import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute – wraps routes like /login and /register.
 * - If the app is still loading, shows a spinner.
 * - If the user IS already logged in, redirects to their dashboard.
 * - If the user is NOT logged in, renders the public page via <Outlet />.
 */
const PublicRoute: React.FC = () => {
  const { isAuth, isAppLoading, user } = useAuth();

  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isAuth && user) {
    const dashboardPath =
      user.role === 'investor' ? '/dashboard/investor' : '/dashboard/entrepreneur';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
