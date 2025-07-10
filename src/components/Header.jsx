import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import LanguageToggle from './LanguageToggle';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLogOut, FiMoon, FiSun } = FiIcons;

const Header = () => {
  const { t } = useLanguage();
  const { isConnected, isRegistered, account, disconnect, userRole } = useWeb3();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  // Check if we're in an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't show header in admin routes - we'll use the AdminLayout instead
  if (userRole === 'admin' && isAdminRoute) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png" 
                alt="Logo" 
                className="h-10 w-auto" 
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/opportunities"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/opportunities') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
              }`}
            >
              {t('nav.opportunities')}
            </Link>

            {userRole === 'admin' && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-yellow-600`}
              >
                Panel de Admin
              </Link>
            )}

            {isConnected && isRegistered && (
              <Link
                to="/profile"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/profile') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
                }`}
              >
                {t('nav.profile')}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition-colors"
            >
              <SafeIcon icon={isDarkMode ? FiSun : FiMoon} className="w-5 h-5" />
            </button>

            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;