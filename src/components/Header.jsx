import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import LanguageToggle from './LanguageToggle';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLogOut, FiUsers, FiSettings } = FiIcons;

const Header = () => {
  const { t } = useLanguage();
  const { isConnected, isRegistered, account, disconnect, userRole } = useWeb3();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-yellow-600">
              Mundo Tangible
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-yellow-600 border-b-2 border-yellow-600' 
                  : 'text-gray-700 hover:text-yellow-600'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/opportunities"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/opportunities') 
                  ? 'text-yellow-600 border-b-2 border-yellow-600' 
                  : 'text-gray-700 hover:text-yellow-600'
              }`}
            >
              {t('nav.opportunities')}
            </Link>
            
            {/* Admin-only navigation */}
            {userRole === 'admin' && (
              <>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/admin/users') 
                      ? 'text-yellow-600 border-b-2 border-yellow-600' 
                      : 'text-gray-700 hover:text-yellow-600'
                  }`}
                >
                  {t('nav.users')}
                </Link>
                <Link
                  to="/admin/opportunities"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/admin/opportunities') 
                      ? 'text-yellow-600 border-b-2 border-yellow-600' 
                      : 'text-gray-700 hover:text-yellow-600'
                  }`}
                >
                  {t('nav.manageOpportunities')}
                </Link>
              </>
            )}
            
            {isConnected && isRegistered && (
              <Link
                to="/profile"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/profile') 
                    ? 'text-yellow-600 border-b-2 border-yellow-600' 
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
              >
                {t('nav.profile')}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
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