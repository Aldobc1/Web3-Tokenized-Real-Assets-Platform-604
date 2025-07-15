import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import LanguageToggle from './LanguageToggle';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLogOut, FiMoon, FiSun, FiMenu, FiX } = FiIcons;

const Header = () => {
  const { t } = useLanguage();
  const { isConnected, isRegistered, account, disconnect, userRole } = useWeb3();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're in an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't show header in admin routes - we'll use the AdminLayout instead
  if (userRole === 'admin' && isAdminRoute) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/opportunities', label: t('nav.opportunities') },
    ...(userRole === 'admin' ? [{ path: '/admin/dashboard', label: 'Panel de Admin' }] : []),
    ...(isConnected && isRegistered ? [{ path: '/profile', label: t('nav.profile') }] : [])
  ];

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <img
                src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-yellow-600 border-b-2 border-yellow-600'
                    : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              <SafeIcon 
                icon={isMobileMenuOpen ? FiX : FiMenu} 
                className="w-6 h-6" 
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-screen opacity-100 visible' 
          : 'max-h-0 opacity-0 invisible overflow-hidden'
      }`}>
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-yellow-500 hover:text-black'
                }`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Actions */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <LanguageToggle />
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 transition-colors"
              >
                <SafeIcon icon={isDarkMode ? FiSun : FiMoon} className="w-5 h-5" />
              </button>
            </div>
            
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    disconnect();
                    closeMobileMenu();
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 w-full p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block w-full bg-yellow-500 text-black px-4 py-3 rounded-lg text-center font-medium hover:bg-yellow-600 transition-colors"
                onClick={closeMobileMenu}
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