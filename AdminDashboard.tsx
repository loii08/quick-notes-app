import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStatus } from './useAuthStatus';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary dark:bg-indigo-500/20 dark:text-indigo-300'
        : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: `env(safe-area-inset-top)` }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/icon.ico" alt="App Icon" className="w-8 h-8 rounded-full" />
                <span className="font-bold text-lg text-gray-800 dark:text-gray-100">Admin Panel</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/admin/analytics" className={navLinkClass}>Analytics</NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>Users</NavLink>
              <NavLink to="/admin/settings" className={navLinkClass}>Settings</NavLink>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.displayName || 'Admin'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Main App</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-2">
            <NavLink to="/admin/analytics" className={navLinkClass}>Analytics</NavLink>
            <NavLink to="/admin/users" className={navLinkClass}>Users</NavLink>
            <NavLink to="/admin/settings" className={navLinkClass}>Settings</NavLink>
          </div>
        </div>
      </header>

      <main
        className="container mx-auto px-4 pt-32"
        style={{ paddingTop: `calc(8rem + env(safe-area-inset-top))` }}
      >
        <Outlet />
      </main>

      <footer
        className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 text-center text-xs border-t border-gray-200 dark:border-gray-700 mt-8"
        style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}
      >
        Quick Notes Admin Panel
      </footer>
    </div>
  );
};

export default AdminDashboard;
```

### Explanation of Changes

1.  **Header `paddingTop`**: I've added `style={{ paddingTop: 'env(safe-area-inset-top)' }}` to the `<header>`. This pushes the header's content down from the top edge of the screen, preventing it from being obscured by the status bar or Dynamic Island.

2.  **Main Content `paddingTop`**: The `<main>` content area now has `style={{ paddingTop: 'calc(8rem + env(safe-area-inset-top))' }}`. This calculation adds the original top padding (`8rem` from `pt-32`) to the safe area inset, ensuring the page content is not hidden behind the now-taller header on iOS.

3.  **Footer `paddingBottom`**: The `<footer>` now includes `style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}` to add space at the bottom, preventing it from being obscured by the home indicator on iPhones.

With this new `AdminDashboard.tsx` component, your admin section will now correctly adapt to the screen layout on iOS devices, providing a seamless and professional experience.

<!--
[PROMPT_SUGGESTION]Can you refactor the loading and error states into reusable components?[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How can I improve the data synchronization logic when the app comes back online?[/PROMPT_SUGGESTION]
-->