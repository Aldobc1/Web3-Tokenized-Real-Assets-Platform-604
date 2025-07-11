import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from './SafeIcon';
import { FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isDarkMode, toggleTheme } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png" 
              alt="Logo" 
              className="h-10 w-auto" 
            />
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/opportunities" 
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/opportunities') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
              }`}
            >
              Oportunidades
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-yellow-600"
              >
                Admin
              </Link>
            )}
            {user && (
              <Link 
                to="/profile" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/profile') ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-700 dark:text-gray-300 hover:text-yellow-600'
                }`}
              >
                Perfil
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600">
              <SafeIcon icon={isDarkMode ? FiSun : FiMoon} className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;