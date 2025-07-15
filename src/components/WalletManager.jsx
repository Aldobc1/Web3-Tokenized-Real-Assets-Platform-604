import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiWallet, FiPlus, FiCopy, FiCheck, FiX, FiTrash2 } = FiIcons;

const WalletManager = () => {
  const { userWallets, addWallet, connectWallet, account, fetchUserWallets, userProfile } = useWeb3();
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualWallet, setManualWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState('');
  const [copiedWallet, setCopiedWallet] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError('');
      setSuccess('');
      const walletAddress = await connectWallet();

      // Check if wallet is already in user's wallets
      const walletExists = userWallets.some(w => w.wallet_address.toLowerCase() === walletAddress.toLowerCase());
      if (walletExists) {
        setSuccess('Esta wallet ya está asociada a tu cuenta');
        return;
      }

      // Add wallet to database
      if (userProfile && userProfile.id) {
        await addWalletToDatabase(walletAddress, userProfile.id);
        
        // If this is the first wallet, also update the user's profile
        if (userWallets.length === 0) {
          await updateUserWithWallet(userProfile.id, walletAddress);
        }
        
        await fetchUserWallets(userProfile.id);
        setSuccess('Wallet conectada y guardada exitosamente');
      } else {
        throw new Error('No se pudo identificar al usuario actual');
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
    setSuccess('');
    setError('');

    // Basic ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualWallet.trim())) {
      setError('Dirección de wallet inválida');
      return;
    }

    try {
      setIsAdding(true);

      // Check if wallet is already in user's wallets
      const walletExists = userWallets.some(w => w.wallet_address.toLowerCase() === manualWallet.toLowerCase());
      if (walletExists) {
        setError('Esta wallet ya está asociada a tu cuenta');
        return;
      }

      // Add wallet to database
      if (userProfile && userProfile.id) {
        await addWalletToDatabase(manualWallet.trim(), userProfile.id);
        
        // If this is the first wallet, also update the user's profile
        if (userWallets.length === 0) {
          await updateUserWithWallet(userProfile.id, manualWallet.trim());
        }
        
        await fetchUserWallets(userProfile.id);
        setManualWallet('');
        setShowAddForm(false);
        setSuccess('Wallet agregada exitosamente');
      } else {
        throw new Error('No se pudo identificar al usuario actual');
      }
    } catch (error) {
      console.error('Error adding manual wallet:', error);
      setError(error.message || 'Error al agregar wallet');
    } finally {
      setIsAdding(false);
    }
  };

  // Function to add wallet to database
  const addWalletToDatabase = async (walletAddress, userId) => {
    try {
      // Check if wallet is already registered to another user
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallets_mt2024')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingWallet) {
        throw new Error('Esta wallet ya está asociada a una cuenta');
      }

      // Insert the new wallet
      const { data, error } = await supabase
        .from('wallets_mt2024')
        .insert([{
          user_id: userId,
          wallet_address: walletAddress,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in addWalletToDatabase:', error);
      throw error;
    }
  };

  // Function to update user with wallet address
  const updateUserWithWallet = async (userId, walletAddress) => {
    try {
      const { error } = await supabase
        .from('users_mt2024')
        .update({ 
          wallet_address: walletAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user with wallet:', error);
      throw error;
    }
  };

  const removeWallet = async (walletId, walletAddress) => {
    if (!userProfile || !userProfile.id) return;
    setIsRemoving(true);

    try {
      // Don't allow removing the last wallet
      if (userWallets.length <= 1) {
        setError('Debes mantener al menos una wallet asociada a tu cuenta');
        return;
      }

      // Don't allow removing the currently active wallet
      if (walletAddress === account) {
        setError('No puedes eliminar la wallet actualmente activa');
        return;
      }

      setError('');
      setSuccess('');
      
      // Delete wallet from database
      const { error } = await supabase
        .from('wallets_mt2024')
        .delete()
        .eq('id', walletId);
        
      if (error) throw error;
      
      // If the removed wallet was stored in the user's profile, update it with another wallet
      if (userProfile.wallet_address === walletAddress) {
        const remainingWallets = userWallets.filter(w => w.wallet_address !== walletAddress);
        if (remainingWallets.length > 0) {
          await updateUserWithWallet(userProfile.id, remainingWallets[0].wallet_address);
        }
      }
      
      await fetchUserWallets(userProfile.id);
      setSuccess('Wallet eliminada exitosamente');
    } catch (error) {
      console.error('Error removing wallet:', error);
      setError('Error al eliminar la wallet: ' + error.message);
    } finally {
      setIsRemoving(false);
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
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
          >
            {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
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
          <SafeIcon icon={FiX} className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center">
          <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
          {success}
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
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                {isAdding ? 'Agregando...' : 'Agregar Wallet'}
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
          userWallets.map((wallet, index) => (
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
                    {wallet.wallet_address === userProfile?.wallet_address && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        Principal
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
                {userWallets.length > 1 && wallet.wallet_address !== account && (
                  <button
                    onClick={() => removeWallet(wallet.id, wallet.wallet_address)}
                    disabled={isRemoving}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    title="Eliminar wallet"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {userWallets.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
          <p>
            💡 <strong>Tip:</strong> Puedes tener múltiples wallets asociadas a tu cuenta. La wallet activa se usa para las transacciones.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletManager;