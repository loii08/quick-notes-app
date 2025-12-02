import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActive
        ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
    }`;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[280px] bg-white dark:bg-gray-950 border-l transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SidebarContent navLinkClasses={navLinkClasses} />
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-white dark:bg-gray-950 md:block">
        <SidebarContent navLinkClasses={navLinkClasses} />
      </div>

      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white dark:bg-gray-950 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-200">
              Admin Dashboard
            </h1>
          </div>
          <button
            className="md:hidden p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            <span className="sr-only">Open sidebar</span>
          </button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ navLinkClasses: (props: { isActive: boolean }) => string }> = ({ navLinkClasses }) => {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white">
          <img src="/icon.ico" alt="App Icon" className="h-6 w-6 rounded-md" />
          <span className="">Quick Notes</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <NavLink to="/admin/users" className={navLinkClasses}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Users
          </NavLink>
          {/* Add other admin links here */}
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;