import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiTool, FiBriefcase, FiDollarSign } = FiIcons;

const AdminDashboard = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: 'Total de Usuarios',
      value: '24',
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Operadores',
      value: '5',
      icon: FiTool,
      color: 'bg-green-500'
    },
    {
      title: 'Oportunidades',
      value: '12',
      icon: FiBriefcase,
      color: 'bg-yellow-500'
    },
    {
      title: 'Valor Tokenizado',
      value: '$1.2M',
      icon: FiDollarSign,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mr-4`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Actividad Reciente
        </h2>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-4">
                <SafeIcon 
                  icon={[FiUsers, FiTool, FiBriefcase, FiDollarSign][index % 4]} 
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400" 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {[
                    'Nuevo usuario registrado',
                    'Operador actualizado',
                    'Nueva oportunidad creada',
                    'Inversión realizada',
                    'Documentos actualizados'
                  ][index]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hace {index + 1} {index === 0 ? 'hora' : 'horas'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;