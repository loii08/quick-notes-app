import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthStatus } from './useAuthStatus';

interface AnalyticsData {
  totalNotes: number;
  totalCategories: number;
  totalQuickActions: number;
}

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface AnalyticsDataViewProps {
  dateFilter: DateFilter;
  userId: string | null;
}

// Helper function to get date range for filtering
const getDateRange = (filter: DateFilter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (filter) {
    case 'today':
      return { start: startOfDay.getTime(), end: endOfDay.getTime() };
    case 'yesterday':
      const yesterday = new Date(startOfDay);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start: yesterday.getTime(), end: yesterdayEnd.getTime() };
    case 'week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return { start: startOfWeek.getTime(), end: now.getTime() };
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfMonth.getTime(), end: now.getTime() };
    case 'all':
    default:
      return null; // No date filtering
  }
};

const AnalyticsDataView: React.FC<AnalyticsDataViewProps> = ({ dateFilter, userId }) => {
  const [data, setData] = useState<AnalyticsData>({
    totalNotes: 0,
    totalCategories: 0,
    totalQuickActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [dateFilter, userId]);

  const fetchAnalytics = async () => {
    if (!userId) {
      setError("User not found.");
      return;
    }

    setLoading(true);
    try {
      const dateRange = getDateRange(dateFilter);

      let totalCategories = 0;
      let totalQuickActions = 0;

      // Notes - Use Firestore to filter by date for efficiency
      const notesConstraints = [where('deletedAt', '==', null)];
      if (dateRange) {
        notesConstraints.push(where('timestamp', '>=', dateRange.start));
        notesConstraints.push(where('timestamp', '<=', dateRange.end));
      }
      const notesQuery = query(
        collection(db, `users/${userId}/notes`),
        ...notesConstraints
      );
      const notesSnapshot = await getDocs(notesQuery);
      const totalNotes = notesSnapshot.size;

      // Categories - no date filtering
      const categoriesSnapshot = await getDocs(collection(db, `users/${userId}/categories`));
      totalCategories = categoriesSnapshot.size;

      // Quick Actions - no date filtering
      const qaSnapshot = await getDocs(collection(db, `users/${userId}/quickActions`));
      totalQuickActions = qaSnapshot.size;

      setData({
        totalNotes,
        totalCategories,
        totalQuickActions,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load your analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex justify-center items-center space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-primary rounded-full animate-juggle"
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.totalNotes}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {dateFilter === 'all' ? 'All time' : `In ${dateFilter}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.totalCategories}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Created by you
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quick Actions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.totalQuickActions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Created by you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserAnalytics: React.FC = () => {
  const { user } = useAuthStatus();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Get user initials
  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const userInitials = getInitials(user?.displayName, user?.email);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navbar */}
      <nav
        className="fixed top-0 w-full z-50 bg-primary dark:bg-gray-900 py-6 shadow-lg"
        style={{ paddingTop: `calc(1.5rem + env(safe-area-inset-top))` }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/icon.ico" alt="App Icon" className="w-10 h-10 rounded-full" />
            <div className="flex flex-col text-textOnPrimary dark:text-white">
              <h1 className="font-extrabold tracking-tight text-2xl">My Analytics</h1>
            </div>
          </div>
          
          <Link to="/" className="text-textOnPrimary dark:text-white hover:text-white/80 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="flex-grow container mx-auto px-4 py-6 mt-20"
        style={{ marginTop: `calc(5rem + env(safe-area-inset-top))` }}
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fade-in">
            <div className="flex items-center gap-6">
              {/* Profile Image or Avatar */}
              <div className="flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {userInitials}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {user?.displayName || 'User'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Member since {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              {/* Date Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
                <select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 sm:px-4 sm:py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center justify-center sm:justify-start gap-2"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          <AnalyticsDataView key={refreshTrigger} dateFilter={dateFilter} userId={user?.uid || null} />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-surface dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-6 text-center text-xs border-t border-borderLight dark:border-gray-700 mt-8"
        style={{ paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom))` }}
      >
        <div className="flex justify-center gap-6 mb-3">
          <a href="https://www.linkedin.com/in/kenneth-irvin-butad-479b4b26b/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.484 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.59-11.018-3.714v-2.155z"/>
            </svg>
          </a>
          <a href="https://kenneth-eta.vercel.app/" target="_blank" rel="noopener noreferrer" title="Portfolio" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v1.5a1.5 1.5 0 01-3 0V12a2 2 0 00-2-2 2 2 0 01-2-2V8.5A1.5 1.5 0 015 7c.667 0 1.167.221 1.652.615C5.42 7.904 4.552 8 4 8c-.141 0-.277.005-.41.015l.742.012z" clipRule="evenodd" />
            </svg>
          </a>
          <a href="mailto:kijbutad08@gmail.com" title="Email" className="hover:text-textMain dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
            </svg>
          </a>
        </div>
        &copy; {new Date().getFullYear()} Kenneth B. All rights reserved.
        <div className="mt-2 text-gray-400 dark:text-gray-600">
          {'Inspired by and for Chan Li ❤️'}
        </div>
        <div className="mt-2 text-gray-400 dark:text-gray-600 text-xs">
          Version {import.meta.env.APP_VERSION}
        </div>
      </footer>
    </div>
  );
};

export default UserAnalytics;