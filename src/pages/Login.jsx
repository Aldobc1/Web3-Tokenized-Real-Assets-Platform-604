import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import SafeIcon from '../components/SafeIcon';
import { FiMail, FiLock, FiUser, FiCreditCard, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, connectWallet } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await connectWallet();
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md"
      >
        <div className="text-center mb-8">
          <img 
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-6" 
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRegistering ? 'Regístrate para acceder' : 'Accede a tu cuenta'}
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setLoginMethod('email')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              loginMethod === 'email' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <SafeIcon icon={FiMail} className="w-5 h-5" />
            <span>Email</span>
          </button>
          <button
            onClick={() => setLoginMethod('wallet')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              loginMethod === 'wallet' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
            <span>Wallet</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <div className="mt-1 relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1 relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
              <div className="mt-1 relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                <div className="mt-1 relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  <span>{isRegistering ? 'Registrando...' : 'Iniciando...'}</span>
                </>
              ) : (
                <span>{isRegistering ? 'Registrarse' : 'Iniciar sesión'}</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={handleWalletConnect}
              disabled={loading}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiCreditCard} className="w-5 h-5 mr-2" />
                  <span>Conectar Wallet</span>
                </>
              )}
            </button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Conecta tu wallet de MetaMask para acceder
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-yellow-600 hover:text-yellow-500"
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;