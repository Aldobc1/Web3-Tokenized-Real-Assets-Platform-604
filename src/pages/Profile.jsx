import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { assets } from '../data/assets';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiWallet, FiTrendingUp, FiDollarSign, FiPercent, FiShield, FiTool, FiCoins } = FiIcons;

const Profile = () => {
  const { t, language } = useLanguage();
  const { userProfile, account, isConnected, userRole } = useWeb3();

  if (!isConnected || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso no autorizado
          </h1>
          <p className="text-gray-600">
            Debes conectar tu wallet y completar el registro
          </p>
        </div>
      </div>
    );
  }

  const getUserHoldings = () => {
    const holdings = [];
    assets.forEach(asset => {
      const userTokens = localStorage.getItem(`holdings_${account}_${asset.id}`);
      if (userTokens && parseInt(userTokens) > 0) {
        holdings.push({
          asset,
          tokens: parseInt(userTokens),
          value: parseInt(userTokens) * asset.tokenPrice
        });
      }
    });
    return holdings;
  };

  const userHoldings = getUserHoldings();
  const totalInvested = userHoldings.reduce((sum, holding) => sum + holding.value, 0);

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
            {t('profile.title')}
          </h1>

          {/* Profile Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {userProfile.name}
                </h2>
                <p className="text-gray-600">{userProfile.email}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <SafeIcon icon={FiWallet} className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                    <SafeIcon icon={getRoleIcon(userRole)} className="w-3 h-3 mr-1" />
                    {t(`role.${userRole}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Invertido</p>
                  <p className="text-2xl font-bold text-yellow-600">${totalInvested}</p>
                </div>
                <SafeIcon icon={FiDollarSign} className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos en Cartera</p>
                  <p className="text-2xl font-bold text-green-600">{userHoldings.length}</p>
                </div>
                <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rendimiento Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userHoldings.length > 0 
                      ? (userHoldings.reduce((sum, h) => sum + h.asset.projectedReturn, 0) / userHoldings.length).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
                <SafeIcon icon={FiPercent} className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Holdings Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t('profile.holdings')}
            </h3>

            {userHoldings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Aún no tienes inversiones en activos tokenizados
                </p>
                <p className="text-gray-400 mt-2">
                  Explora las oportunidades disponibles para comenzar a invertir
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userHoldings.map((holding, index) => (
                  <motion.div
                    key={holding.asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={holding.asset.image}
                        alt={language === 'es' ? holding.asset.name : holding.asset.nameEn}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {language === 'es' ? holding.asset.name : holding.asset.nameEn}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t(`asset.${holding.asset.type}`)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {holding.tokens} tokens × ${holding.asset.tokenPrice}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        ${holding.value}
                      </p>
                      <p className="text-sm text-green-600">
                        +{holding.asset.projectedReturn}% proyectado
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;