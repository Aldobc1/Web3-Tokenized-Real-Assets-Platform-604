import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiUsers, FiBuildingOffice, FiTruck, FiDollarSign } = FiIcons;

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalOperators: 0,
    totalOpportunities: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics from Supabase
      const [usersCount, operatorsCount, opportunitiesCount, totalValue] = await Promise.all([
        // Get total users
        supabase
          .from('users_mt2024')
          .select('id', { count: 'exact' }),
        
        // Get total operators
        supabase
          .from('operators_mt2024')
          .select('id', { count: 'exact' }),
        
        // Get total opportunities
        supabase
          .from('assets_mt2024')
          .select('id', { count: 'exact' }),
        
        // Get total value (sum of token_price * sold)
        supabase
          .from('assets_mt2024')
          .select('token_price, sold')
      ]);

      // Calculate total value
      const calculatedTotalValue = totalValue.data?.reduce((sum, asset) => {
        return sum + (asset.token_price * (asset.sold || 0));
      }, 0) || 0;

      setStatistics({
        totalUsers: usersCount.count || 0,
        totalOperators: operatorsCount.count || 0,
        totalOpportunities: opportunitiesCount.count || 0,
        totalValue: calculatedTotalValue
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total de Usuarios',
      value: statistics.totalUsers.toString(),
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Operadores',
      value: statistics.totalOperators.toString(),
      icon: FiBuildingOffice,
      color: 'bg-green-500'
    },
    {
      title: 'Oportunidades',
      value: statistics.totalOpportunities.toString(),
      icon: FiTruck,
      color: 'bg-yellow-500'
    },
    {
      title: 'Valor Tokenizado',
      value: `$${statistics.totalValue.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} bg-opacity-10 rounded-full p-3`}>
                <SafeIcon
                  icon={stat.icon}
                  className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Panel de actividad en desarrollo
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;