import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface AdminRouteProps {
  user: User | null;
  userRole: string;
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ user, userRole, children }) => {
  if (!user) {
    // User is not logged in, redirect to the main page which will show the login modal.
    return <Navigate to="/" replace />;
  }

  if (userRole !== 'admin') {
    // User is logged in but not an admin, redirect to the not-authorized page.
    return <Navigate to="/not-authorized" replace />;
  }

  // User is logged in and is an admin, render the requested component.
  return <>{children}</>;
};

export default AdminRoute;