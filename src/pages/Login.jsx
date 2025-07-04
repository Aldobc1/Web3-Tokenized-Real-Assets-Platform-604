import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiWallet, FiUser, FiMail, FiCheck } = FiIcons;

const Login = () => {
  const { t } = useLanguage();
  const { connectWallet, isConnected, isRegistered, registerUser } = useWeb3();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    declaration: false,
    terms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegistration = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    if (!formData.declaration || !formData.terms) {
      alert('Debes aceptar la declaración y los términos y condiciones');
      return;
    }
    
    registerUser(formData);
    navigate('/');
  };

  if (isConnected && isRegistered) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isConnected ? t('auth.register') : t('auth.connectWallet')}
          </h2>
          <p className="text-gray-600">
            {isConnected 
              ? 'Completa tu registro para comenzar a invertir'
              : 'Conecta tu wallet MetaMask para comenzar'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {!isConnected ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiWallet} className="w-8 h-8 text-primary-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Para acceder a Mundo Tangible necesitas conectar tu wallet MetaMask
                </p>
              </div>
              
              <button
                onClick={connectWallet}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiWallet} className="w-5 h-5" />
                {t('auth.connectWallet')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegistration} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="declaration"
                      checked={formData.declaration}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="text-gray-700">
                      {t('auth.declaration')}
                    </label>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="text-gray-700">
                      {t('auth.terms')}
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                {t('auth.complete')}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;