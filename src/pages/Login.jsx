import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useWeb3 } from '../contexts/Web3Context';

const { FiMail, FiLock, FiUser, FiWallet } = FiIcons;

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'wallet'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      // Lógica de registro
    } else {
      // Lógica de inicio de sesión
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setLoginMethod('email')}
            className={`px-4 py-2 rounded-lg ${
              loginMethod === 'email'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <SafeIcon icon={FiMail} className="w-5 h-5" />
            Email
          </button>
          <button
            onClick={() => setLoginMethod('wallet')}
            className={`px-4 py-2 rounded-lg ${
              loginMethod === 'wallet'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <SafeIcon icon={FiWallet} className="w-5 h-5" />
            Wallet
          </button>
        </div>

        {loginMethod === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1 relative">
                  <SafeIcon
                    icon={FiUser}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    name="name"
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <SafeIcon
                  icon={FiMail}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <SafeIcon
                  icon={FiLock}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="mt-1 relative">
                  <SafeIcon
                    icon={FiLock}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-3 rounded-lg"
            >
              {isRegistering ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg"
            >
              Conectar Wallet
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-yellow-600 hover:text-yellow-500"
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