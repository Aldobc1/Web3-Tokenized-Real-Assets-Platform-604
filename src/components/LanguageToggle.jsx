import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiGlobe } = FiIcons;

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
    >
      <SafeIcon icon={FiGlobe} className="w-4 h-4" />
      {language === 'es' ? 'EN' : 'ES'}
    </button>
  );
};

export default LanguageToggle;