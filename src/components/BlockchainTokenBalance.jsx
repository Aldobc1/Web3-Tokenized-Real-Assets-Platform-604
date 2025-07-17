import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getERC20Balance } from '../services/erc20BalanceService';

const { FiRefreshCw, FiDatabase, FiAlertTriangle } = FiIcons;

const BlockchainTokenBalance = ({ contractAddress, userWallet, assetName }) => {
  const [balance, setBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  const fetchTokenBalance = async () => {
    if (!contractAddress || !userWallet) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Usar el nuevo servicio para consultar el balance
      const result = await getERC20Balance(contractAddress, userWallet, 'polygon');

      // Actualizar el estado con los datos obtenidos
      setBalance(result.balance);
      setTokenSymbol(result.symbol);
      setTokenName(result.name);
      setDecimals(result.decimals);
      setNetworkInfo({
        name: 'Polygon',
        chainId: 137
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching blockchain balance:", err);
      setError("No se pudo obtener el balance desde la blockchain: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenBalance();
  }, [contractAddress, userWallet]);

  if (!contractAddress) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Este asset no tiene un smart contract asociado
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <SafeIcon icon={FiDatabase} className="w-5 h-5 text-blue-500 mr-2" />
          Balance en Blockchain
        </h3>
        <button
          onClick={fetchTokenBalance}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <div className="flex items-start mb-2">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>Error de conexión</span>
          </div>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
              Balance de {tokenName || tokenSymbol || assetName} en tu wallet:
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {balance !== null ? balance.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0"}
              {tokenSymbol && ` ${tokenSymbol}`}
            </p>
          </div>

          {networkInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Red: {networkInfo.name || "Polygon"} (Chain ID: {networkInfo.chainId?.toString() || "137"})
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Contrato: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
            {lastUpdated && (
              <span>Actualizado: {lastUpdated.toLocaleString()}</span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            * Datos obtenidos directamente de la blockchain
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BlockchainTokenBalance;