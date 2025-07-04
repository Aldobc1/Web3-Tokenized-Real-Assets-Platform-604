import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiUser, FiShield, FiTool, FiCoins } = FiIcons;

const AdminUsers = () => {
  const { t } = useLanguage();
  const { userRole, getAllUsers } = useWeb3();

  // Redirect if not admin
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  const users = getAllUsers();
  const adminUsers = users.filter(user => user.role === 'admin');
  const operatorUsers = users.filter(user => user.role === 'operador');
  const tokenizerUsers = users.filter(user => user.role === 'tokenizer');

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return FiShield;
      case 'operador':
        return FiTool;
      default:
        return FiCoins;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'operador':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('admin.users.title')}
          </h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.users.total')}</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <SafeIcon icon={FiUsers} className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.users.admins')}</p>
                  <p className="text-2xl font-bold text-red-600">{adminUsers.length}</p>
                </div>
                <SafeIcon icon={FiShield} className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.users.operators')}</p>
                  <p className="text-2xl font-bold text-blue-600">{operatorUsers.length}</p>
                </div>
                <SafeIcon icon={FiTool} className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.users.tokenizers')}</p>
                  <p className="text-2xl font-bold text-yellow-600">{tokenizerUsers.length}</p>
                </div>
                <SafeIcon icon={FiCoins} className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Lista de Usuarios
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <motion.tr
                      key={user.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiUser} className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <SafeIcon icon={getRoleIcon(user.role)} className="w-3 h-3 mr-1" />
                          {t(`role.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">
                          {user.address?.slice(0, 6)}...{user.address?.slice(-4)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUsers;