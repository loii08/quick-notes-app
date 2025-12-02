import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        You do not have permission to view this page.
      </p>
      <Link to="/" className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primaryDark transition-colors">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotAuthorized;