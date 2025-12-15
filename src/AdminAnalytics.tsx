import React, { useState, useEffect } from 'react';
import { db, auth } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface AnalyticsData {
  totalUsers: number;
  totalNotes: number;
  totalCategories: number;
  totalQuickActions: number;
}

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface User {
  id: string;
  email: string;
  role: string;
}
interface AnalyticsDataViewProps {
  dateFilter: DateFilter;
  selectedUser: string;
  users: User[];
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

const AnalyticsDataView: React.FC<AnalyticsDataViewProps> = ({ dateFilter, selectedUser, users }) => {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalNotes: 0,
    totalCategories: 0,
    totalQuickActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateFilter, selectedUser]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }
      const dateRange = getDateRange(dateFilter);

      if (selectedUser === 'all') {
        // Aggregate data across all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        let totalNotes = 0;
        let totalCategories = 0;
        let totalQuickActions = 0;

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;

          // Notes - filter by date if not 'all'
          if (dateRange) {
            const notesQuery = query(
              collection(db, `users/${userId}/notes`),
              where('timestamp', '>=', dateRange.start),
              where('timestamp', '<=', dateRange.end)
            );
            const notesSnapshot = await getDocs(notesQuery);
            // Filter out deleted notes in memory
            const nonDeletedNotes = notesSnapshot.docs.filter(doc => !doc.data().deletedAt);
            totalNotes += nonDeletedNotes.length;
          } else {
            // For 'all' time, count all non-deleted notes
            const notesQuery = query(
              collection(db, `users/${userId}/notes`),
              where('deletedAt', '==', null)
            );
            const notesSnapshot = await getDocs(notesQuery);
            totalNotes += notesSnapshot.size;
          }

          // Categories - no date filtering
          const categoriesSnapshot = await getDocs(collection(db, `users/${userId}/categories`));
          totalCategories += categoriesSnapshot.size;

          // Quick Actions - no date filtering
          const qaSnapshot = await getDocs(collection(db, `users/${userId}/quickActions`));
          totalQuickActions += qaSnapshot.size;
        }

        setData({
          totalUsers,
          totalNotes,
          totalCategories,
          totalQuickActions,
        });
      } else {
        // Show data for specific user
        const userId = selectedUser;

        let totalNotes = 0;
        let totalCategories = 0;
        let totalQuickActions = 0;

        // Notes - filter by date if not 'all'
        if (dateRange) {
          const notesQuery = query(
            collection(db, `users/${userId}/notes`),
            where('timestamp', '>=', dateRange.start),
            where('timestamp', '<=', dateRange.end)
          );
          const notesSnapshot = await getDocs(notesQuery);
          const nonDeletedNotes = notesSnapshot.docs.filter(doc => !doc.data().deletedAt);
          totalNotes = nonDeletedNotes.length;
        } else {
          const notesQuery = query(
            collection(db, `users/${userId}/notes`),
            where('deletedAt', '==', null)
          );
          const notesSnapshot = await getDocs(notesQuery);
          totalNotes = notesSnapshot.size;
        }

        // Categories - no date filtering
        const categoriesSnapshot = await getDocs(collection(db, `users/${selectedUser}/categories`));
        totalCategories = categoriesSnapshot.size;

        // Quick Actions - no date filtering
        const qaSnapshot = await getDocs(collection(db, `users/${selectedUser}/quickActions`));
        totalQuickActions = qaSnapshot.size;

        setData({
          totalUsers: 1, // Single user selected
          totalNotes,
          totalCategories,
          totalQuickActions,
        });
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data.');
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {selectedUser === 'all' ? 'Total Users' : 'Selected User'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.totalUsers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {selectedUser === 'all' ? 'All registered' : users.find(u => u.id === selectedUser)?.email || 'User data'}
              </p>
            </div>
          </div>
        </div>

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
                {selectedUser === 'all' ? (dateFilter === 'all' ? 'All time' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)) : 
                 (dateFilter === 'all' ? 'All user notes' : `${dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)} notes`)}
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
                {selectedUser === 'all' ? 'All users' : 'User categories'}
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
                {selectedUser === 'all' ? 'All users' : 'User quick actions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {selectedUser === 'all' ? 'Quick Stats' : 'User Overview'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {selectedUser === 'all' ? (
            <>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{(data.totalNotes / Math.max(data.totalUsers, 1)).toFixed(1)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Notes per User</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{(data.totalCategories / Math.max(data.totalUsers, 1)).toFixed(1)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Categories per User</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{(data.totalQuickActions / Math.max(data.totalUsers, 1)).toFixed(1)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Quick Actions per User</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{data.totalNotes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Notes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{data.totalCategories}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{data.totalQuickActions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Quick Actions</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminAnalytics: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email || 'No email',
        role: doc.data().role || 'user'
      }));
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          {/* User Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="user-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">User:</label>
            <select
              id="user-filter"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} ({user.role})
                </option>
              ))}
            </select>
          </div>

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
            Refresh
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <AnalyticsDataView key={refreshTrigger} dateFilter={dateFilter} selectedUser={selectedUser} users={users} />
    </div>
  );
};

export default AdminAnalytics;