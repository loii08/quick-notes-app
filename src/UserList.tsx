import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import ConfirmationModal from './components/ConfirmationModal';
import ToastContainer from './components/ToastContainer';
import UserListSkeleton from './UserListSkeleton';
import { ToastMessage, ToastType } from './types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Timestamp | null;
  lastLogin: Timestamp | null;
  lastUpdate?: Timestamp | null;
  notesCount?: number;
  categoryCount?: number;
  quickActionCount?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const USERS_PER_PAGE = 10;

const UserList: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false); // for refresh/pagination
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    action: 'delete' | 'roleChange';
    user: AppUser;
    onConfirm: () => void;
    message: string;
  } | null>(null);

  // Track expanded rows by UID
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (nextPage = false, silent = false) => {
    if (!silent) setInitialLoading(true);
    else setListLoading(true);

    try {
      const usersCollectionRef = collection(db, 'users');
      let q = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(USERS_PER_PAGE));

      if (nextPage && lastVisible) {
        q = query(usersCollectionRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(USERS_PER_PAGE));
      }

      const documentSnapshots = await getDocs(q);
      const usersData = documentSnapshots.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      } as AppUser));

      setUsers(usersData);
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setIsLastPage(documentSnapshots.docs.length < USERS_PER_PAGE);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Permission denied. You must be an admin to view this list.');
    } finally {
      if (!silent) setInitialLoading(false);
      else setListLoading(false);
    }
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    const newToast: ToastMessage = { id: generateId(), message, type, isClosing: false };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => (t.id === newToast.id ? { ...t, isClosing: true } : t)));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== newToast.id)), 300);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, isClosing: true } : t)));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  };

  const handleRoleChange = async (uid: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const userDocRef = doc(db, 'users', uid);
    try {
      await updateDoc(userDocRef, { role: newRole });
      showToast(`User role changed to ${newRole}.`);
      fetchUsers(false, true);
    } catch {
      showToast('Failed to change user role.', 'error');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    try {
      await deleteDoc(userDocRef);
      showToast('User profile deleted successfully.');
      fetchUsers(false, true);
    } catch {
      showToast('Failed to delete user profile.', 'error');
    }
  };

  const toggleRow = (uid: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uid)) newSet.delete(uid);
      else newSet.add(uid);
      return newSet;
    });
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 relative">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <button
            onClick={() => fetchUsers(false, true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh Users"
          >
            <ArrowPathIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        {(initialLoading || listLoading) ? (
          <UserListSkeleton />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map(user => {
                const isExpanded = expandedRows.has(user.uid);
                return (
                  <React.Fragment key={user.uid}>
                    <tr className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => toggleRow(user.uid)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleRow(user.uid);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                        >
                          {isExpanded ? 'Collapse' : 'Show More'}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                        <td colSpan={3} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                            <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 p-2 rounded-md text-center text-sm font-semibold">
                              Notes: {user.notesCount ?? 0}
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-2 rounded-md text-center text-sm font-semibold">
                              Categories: {user.categoryCount ?? 0}
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 p-2 rounded-md text-center text-sm font-semibold">
                              Quick Actions: {user.quickActionCount ?? 0}
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300 mb-2">
                            <div><strong>Role:</strong> {user.role}</div>
                            <div><strong>Created On:</strong> {formatDate(user.createdAt)}</div>
                            <div><strong>Last Login:</strong> {formatDate(user.lastLogin)}</div>
                            <div><strong>Last Update:</strong> {formatDate(user.lastUpdate)}</div>
                          </div>

                          <div className="flex gap-4">
                            <button
                              onClick={() => setConfirmAction({
                                action: 'roleChange',
                                user,
                                onConfirm: () => handleRoleChange(user.uid, user.role),
                                message: `Are you sure you want to change this user's role to ${user.role === 'admin' ? 'user' : 'admin'}?`
                              })}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                            >
                              {user.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              onClick={() => setConfirmAction({
                                action: 'delete',
                                user,
                                onConfirm: () => handleDeleteUser(user.uid),
                                message: "Are you sure you want to delete this user's profile? This does not delete their authentication account."
                              })}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {(initialLoading || listLoading) ? <UserListSkeleton /> :
          filteredUsers.map(user => {
            const isExpanded = expandedRows.has(user.uid);
            return (
              <div key={user.uid} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{user.displayName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {user.status}
                  </span>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600' : 'max-h-0'}`}>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {/* Column 1: Labels */}
                    <div className="col-span-1 space-y-2 font-semibold text-gray-500 dark:text-gray-400">
                      <div>Role:</div>
                      <div>Created On:</div>
                      <div>Last Login:</div>
                      <div>Last Update:</div>
                    </div>
                    {/* Column 2: Values */}
                    <div className="col-span-2 space-y-2 text-right font-medium text-gray-800 dark:text-gray-200">
                      <div className="truncate">{user.role}</div>
                      <div className="truncate">{formatDate(user.createdAt)}</div>
                      <div className="truncate">{formatDate(user.lastLogin)}</div>
                      <div className="truncate">{formatDate(user.lastUpdate)}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfirmAction({
                        action: 'roleChange',
                        user,
                        onConfirm: () => handleRoleChange(user.uid, user.role),
                        message: `Are you sure you want to change this user's role to ${user.role === 'admin' ? 'user' : 'admin'}?`
                      })}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      onClick={() => setConfirmAction({
                        action: 'delete',
                        user,
                        onConfirm: () => handleDeleteUser(user.uid),
                        message: "Are you sure you want to delete this user's profile? This does not delete their authentication account."
                      })}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => toggleRow(user.uid)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                >
                  {isExpanded ? 'Collapse' : 'Show More'}
                </button>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => fetchUsers(true, true)}
          disabled={isLastPage || listLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primaryDark disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Next Page
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmationModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }}
          title={confirmAction.action === 'delete' ? 'Delete User?' : 'Change Role?'}
          message={confirmAction.message}
          confirmText={confirmAction.action === 'delete' ? 'Delete' : 'Confirm'}
          isDestructive={confirmAction.action === 'delete'}
        />
      )}
    </div>
  );
};

export default UserList;
