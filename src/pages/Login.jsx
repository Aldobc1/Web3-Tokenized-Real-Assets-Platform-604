import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useWeb3 } from '../contexts/Web3Context';

const { FiMail, FiLock, FiUser, FiWallet, FiAlertCircle, FiCheck } = FiIcons;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectWallet, registerUser, loginWithEmail, registerWithEmail, isConnected, isRegistered, sessionLoaded } = useWeb3();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    declaration: false,
    terms: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (sessionLoaded && isConnected && isRegistered) {
      // Get the intended destination from the location state, or default to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [sessionLoaded, isConnected, isRegistered, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleConnectWallet = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await connectWallet();
      setSuccess('Wallet conectada exitosamente');
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Error al conectar wallet: ' + (error.message || 'Intenta de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        // Validate declaration and terms
        if (!formData.declaration || !formData.terms) {
          throw new Error('Debes aceptar los términos y la declaración para registrarte');
        }

        // Register with email and password
        await registerWithEmail({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          declaration: formData.declaration,
          terms: formData.terms
        });
        
        setSuccess('Registro exitoso. Redirigiendo...');
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        // Login with email and password
        await loginWithEmail(formData.email, formData.password);
        
        setSuccess('Inicio de sesión exitoso. Redirigiendo...');
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we're still checking the session status, show a loading indicator
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <img 
            src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1751995492624-Este%20amarillo.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRegistering 
              ? 'Regístrate para acceder a Mundo Tangible' 
              : 'Accede a tu cuenta de Mundo Tangible'
            }
          </p>
        </div>

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
            <SafeIcon icon={FiWallet} className="w-5 h-5" />
            <span>Wallet</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiCheck} className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loginMethod === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <div className="mt-1 relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Contraseña
                  </label>
                  <div className="mt-1 relative">
                    <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="declaration"
                      id="declaration"
                      checked={formData.declaration}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="declaration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Declaro que no vivo en Estados Unidos
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="terms"
                      id="terms"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Acepto los términos y condiciones
                    </label>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>{isRegistering ? 'Registrando...' : 'Iniciando sesión...'}</span>
                </>
              ) : (
                <span>{isRegistering ? 'Registrarse' : 'Iniciar sesión'}</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={handleConnectWallet}
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiWallet} className="w-5 h-5" />
                  <span>Conectar Wallet</span>
                </>
              )}
            </button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Conecta tu wallet de MetaMask para acceder
            </p>
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(''); // Clear any errors when switching modes
              // Reset form when switching between register and login
              setFormData({
                ...formData,
                confirmPassword: '',
                declaration: false,
                terms: false,
              });
            }}
            className="text-sm text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;