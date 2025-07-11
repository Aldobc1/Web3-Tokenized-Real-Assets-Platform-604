import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import SafeIcon from '../components/SafeIcon';
import { FiUser, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const Profile = () => {
  const { user, logout, getUserHoldings } = useAuth();
  const holdings = getUserHoldings();
  const totalInvested = holdings.reduce((total, holding) => 
    total + (holding.tokens * holding.asset.tokenPrice), 0
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Debes iniciar sesión para ver tu perfil
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mi Perfil</h1>
          <p className="text-gray-600 dark:text-gray-300">Gestiona tus inversiones y datos personales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                  <SafeIcon icon={FiUser} className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                
                {user.wallet && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 mb-4 w-full">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                      {user.wallet}
                    </span>
                  </div>
                )}

                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rol</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{user.role}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Invertido</span>
                    <span className="font-medium text-green-600">${totalInvested.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Activos</span>
                    <span className="font-medium text-gray-900 dark:text-white">{holdings.length}</span>
                  </div>
                </div>

                <button 
                  onClick={logout}
                  className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </div>

          {/* Holdings */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mis Inversiones</h3>
              
              {holdings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Activo</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Tokens</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Valor</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Retorno</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr key={`${holding.assetId}-${holding.id}`} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img 
                                src={holding.asset.image} 
                                alt={holding.asset.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{holding.asset.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{holding.asset.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {holding.tokens.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end">
                              <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-600 mr-1" />
                              <span className="font-medium text-green-600">
                                {(holding.tokens * holding.asset.tokenPrice).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end">
                              <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-blue-600 mr-1" />
                              <span className="font-medium text-blue-600">
                                {holding.asset.projectedReturn}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">No tienes inversiones activas</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Explora las oportunidades disponibles y realiza tu primera inversión
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;