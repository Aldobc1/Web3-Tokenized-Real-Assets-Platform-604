import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {
  FiHome,      // Dashboard
  FiUsers,     // Usuarios
  FiTractor,   // Oportunidades
  FiBuilding,  // Operadores
  FiFileText   // Smart Contracts
} = FiIcons;

const menuItems = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: FiHome
  },
  {
    path: '/admin/users',
    label: 'Usuarios',
    icon: FiUsers
  },
  {
    path: '/admin/opportunities',
    label: 'Oportunidades',
    icon: FiTractor
  },
  {
    path: '/admin/operators',
    label: 'Operadores',
    icon: FiBuilding
  },
  {
    path: '/admin/smart-contracts',
    label: 'Smart Contracts',
    icon: FiFileText
  }
];

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <img
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png"
            alt="Logo"
            className="h-8"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;