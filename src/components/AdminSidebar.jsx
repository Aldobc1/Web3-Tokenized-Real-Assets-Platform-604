import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { FiHome, FiUsers, FiTruck, FiFileText, FiBriefcase } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

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
    icon: FiTruck // Tractor/Maquinaria pesada para oportunidades
  },
  {
    path: '/admin/operators',
    label: 'Operadores',
    icon: FiBriefcase // Edificio/oficina para operadores
  },
  {
    path: '/admin/smart-contracts',
    label: 'Smart Contracts',
    icon: FiFileText // Documento para smart contracts
  }
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin/dashboard" className="flex items-center">
            <img
              src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Admin
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-500 dark:text-gray-400'}`}
                  />
                  <span className="ml-3">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiIcons.FiLogOut} className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="ml-3">Volver al sitio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;