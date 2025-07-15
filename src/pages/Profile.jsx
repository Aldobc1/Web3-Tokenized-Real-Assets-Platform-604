import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import ReferralProgram from '../components/ReferralProgram';
import WalletManager from '../components/WalletManager';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiCopy } = FiIcons;

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isConnected, account, userProfile, userRole, userWallets, sessionLoaded } = useWeb3();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionLoaded && (!isConnected || !userProfile)) {
      navigate('/login');
      return;
    }
  }, [isConnected, userProfile, account, sessionLoaded, userWallets]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Dirección copiada al portapapeles');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Show loading screen while session is being loaded
  if (!sessionLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - User Info & Wallet Management */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {userProfile.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userProfile.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {account && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.wallet')} Activa
                    </label>
                    <div className="flex items-center mt-1">
                      <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(account)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      >
                        <SafeIcon icon={FiCopy} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.role')}
                  </label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {t(`role.${userRole}`)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Wallets Registradas
                  </label>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {userWallets.length} wallet{userWallets.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Wallet Management */}
            <WalletManager />
          </div>

          {/* Right Column - Referral Program */}
          <div className="space-y-6">
            {/* Referral Program */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ReferralProgram />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;