import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiShare2, FiCopy, FiGift, FiUsers } = FiIcons;

const ReferralProgram = () => {
  const { t } = useLanguage();
  const { account } = useWeb3();
  const [copied, setCopied] = useState(false);

  const referralCode = account ? `MT${account.slice(-6).toUpperCase()}` : '';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mundo Tangible',
          text: 'Únete a Mundo Tangible y invierte en activos tokenizados',
          url: referralLink
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiGift} className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('referral.title')}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300">
          {t('referral.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('referral.code')}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralCode}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiCopy} className="w-4 h-4" />
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={shareReferral}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiShare2} className="w-4 h-4" />
          <span>{t('referral.share')}</span>
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiGift} className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('referral.rewards')}</span>
            </div>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">$0</span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('referral.referrals')}</span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</span>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Cómo funciona:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Comparte tu código de referido</li>
            <li>• Tus amigos se registran usando tu código</li>
            <li>• Ganas $10 por cada referido que invierta</li>
            <li>• Tu amigo también recibe $5 de bonificación</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralProgram;