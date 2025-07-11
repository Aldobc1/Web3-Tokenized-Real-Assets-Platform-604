import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiWallet, FiPlus, FiCopy, FiCheck, FiX, FiAlertCircle } = FiIcons;

const WalletManager = () => {
  const { userWallets, addWallet, connectWallet, account, fetchUserWallets, userProfile } = useWeb3();
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualWallet, setManualWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [copiedWallet, setCopiedWallet] = useState('');

  const handleConnectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError('');
      const walletAddress = await connectWallet();
      
      // Intenta asociar la wallet al usuario actual
      try {
        await addWallet(walletAddress);
        alert('Wallet conectada y guardada exitosamente');
      } catch (error) {
        if (error.message === 'Esta wallet ya está asociada a una cuenta') {
          setError('Esta wallet ya está asociada a otra cuenta. Por favor utiliza otra wallet o agrega una manualmente.');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Error al conectar wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddManualWallet = async (e) => {
    e.preventDefault();
    if (!manualWallet.trim()) return;

    // Basic ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualWallet.trim())) {
      setError('Dirección de wallet inválida');
      return;
    }

    try {
      setIsAdding(true);
      setError('');
      await addWallet(manualWallet.trim());
      setManualWallet('');
      setShowAddForm(false);
      alert('Wallet agregada exitosamente');
    } catch (error) {
      console.error('Error adding manual wallet:', error);
      setError(error.message || 'Error al agregar wallet');
    } finally {
      setIsAdding(false);
    }
  };

  const copyToClipboard = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedWallet(address);
      setTimeout(() => setCopiedWallet(''), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Determinar si debe mostrar un mensaje prominente para conectar wallet
  const showNoWalletsMessage = userWallets.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <SafeIcon icon={FiWallet} className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestión de Wallets
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleConnectMetaMask}
            disabled={isConnecting}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm flex items-center"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <img src="https://metamask.io/images/metamask-fox.svg" alt="MetaMask" className="w-4 h-4 mr-2" />
                <span>Conectar MetaMask</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1 text-sm"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Agregar Manual
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prominent Message When No Wallets */}
      {showNoWalletsMessage && !error && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start">
            <SafeIcon icon={FiAlertCircle} className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                No tienes wallets asociadas a tu cuenta
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Para realizar inversiones y gestionar tus activos, necesitas conectar o agregar una wallet. 
                Puedes conectar MetaMask automáticamente o agregar una dirección de wallet manualmente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Wallet Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
        >
          <form onSubmit={handleAddManualWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección de Wallet
              </label>
              <input
                type="text"
                value={manualWallet}
                onChange={(e) => setManualWallet(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                required
                disabled={isAdding}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Ingresa una dirección de wallet de Ethereum válida comenzando con 0x
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={isAdding}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isAdding || !manualWallet.trim()}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <span>Agregar Wallet</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Wallets List */}
      <div className="space-y-3">
        {userWallets.length === 0 ? (
          <div className="text-center py-8">
            <SafeIcon icon={FiWallet} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tienes wallets registradas
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Conecta tu MetaMask o agrega una wallet manualmente
            </p>
          </div>
        ) : (
          <>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tus Wallets ({userWallets.length})
            </h4>
            {userWallets.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                    <SafeIcon icon={FiWallet} className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {wallet.wallet_address.slice(0, 6)}...{wallet.wallet_address.slice(-4)}
                      </code>
                      {wallet.wallet_address === account && (
                        <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                          Activa
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Agregada: {new Date(wallet.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(wallet.wallet_address)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Copiar dirección"
                  >
                    <SafeIcon 
                      icon={copiedWallet === wallet.wallet_address ? FiCheck : FiCopy} 
                      className={`w-4 h-4 ${copiedWallet === wallet.wallet_address ? 'text-green-600' : ''}`} 
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {userWallets.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
          <p>
            💡 <strong>Tip:</strong> Puedes tener múltiples wallets asociadas a tu cuenta. 
            La wallet activa se usa para las transacciones.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletManager;