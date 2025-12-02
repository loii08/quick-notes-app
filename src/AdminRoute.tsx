import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  userRole: string;
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ userRole, children }) => {
  if (userRole !== 'admin') {
    // Redirect them to the /not-authorized page if they are not an admin
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;