import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/users', name: 'Users', icon: '👥' },
    { path: '/programs', name: 'Programs', icon: '📚' },
    { path: '/posts', name: 'Posts', icon: '📝' },
    { path: '/analytics', name: 'Analytics', icon: '📈' },
    { path: '/settings', name: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-20 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold font-heading text-primary-600 dark:text-primary-400">
          IM Admin
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{isSidebarOpen ? '✕' : '☰'}</span>
        </button>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-30 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400">
            Intentional Movement
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Admin Dashboard</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-body ${
                    location.pathname === item.path
                      ? 'bg-primary-50 dark:bg-accent-500/20 text-primary-700 dark:text-accent-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
          <button
            onClick={toggleDarkMode}
            className="w-full mb-3 px-4 py-2 text-sm font-medium font-body text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-300 font-medium">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium font-body text-gray-900 dark:text-gray-100 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium font-body text-red-600 dark:text-accent-400 hover:bg-red-50 dark:hover:bg-accent-900/20 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 lg:mt-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
